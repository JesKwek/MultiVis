"""
Author: Jes Kwek Hui Min
Description: A class for making heatmaps from chromosomal conformation data, 
adapted from the SPRITE pipeline developed by the Guttman Lab.
URL: https://github.com/GuttmanLab/sprite-pipeline/blob/master/scripts/python/contact.py
"""

import numpy as np
import subprocess
import os
import platform

__author__ = "Jes Kwek Hui Min"

class Contacts:
    """
    A class for generating heatmaps from chromosomal conformation data, adapted from the Guttman Lab's SPRITE pipeline.

    This class includes methods for handling various SPRITE data formats to create intra- and inter-chromosomal
    contact matrices. Some functions in this class are based on or directly adapted from the original SPRITE pipeline
    code available at: https://github.com/GuttmanLab/sprite-pipeline/blob/master/scripts/python/contact.py.
    """


    def __init__(self, chromosome_size_x, chromosome_size_y, resolution, downweighting):
        """
        Initializes a Contacts object.

        Args:
            chromosome_size_x (int): Size of the first chromosome.
            chromosome_size_y (int): Size of the second chromosome.
            resolution (int): Resolution of the contact matrix.
            downweighting (str): Type of down-weighting to apply ('none', 'n_minus_one', or other).
        """

        self._min_matrix_value = 0.0
        self._max_matrix_value = 0.0
        self._downweighting = downweighting
        self._chromosome_size_x = chromosome_size_x
        self._chromosome_size_y = chromosome_size_y
        self._resolution = int(resolution)
        self._matrix = self.init_genome_matrix()

    def init_genome_matrix(self):
        """
        Initializes an internal heatmap matrix with dimensions based on chromosome sizes and resolution.

        This method is used for genome-wide interchromosomal heatmaps only.

        Returns:
            np.ndarray: Initialized matrix filled with zeros.
        """
        num_bins_x = -(-self._chromosome_size_x // self._resolution )
        num_bins_y = -(-self._chromosome_size_y // self._resolution )
        contacts = np.zeros((num_bins_x, num_bins_y))
        # print(contacts.shape)
        return contacts
    
    def get_inc(self, inc):
        """
        Get the pairwise interaction calculation value based on the down-weighting setting.

        Args:
            inc (int): Increment value used in the calculation.

        Returns:
            float: Calculated weight based on the increment value and down-weighting setting.
        """
        if self._downweighting == "none":
            return 1.0
        elif self._downweighting == "n_minus_one":
            return 1.0 / (inc - 1)
        else:
            return 2.0 / float(inc)
        
    def find_max_min_value(self, current):
        """
        Updates the maximum and minimum matrix values based on the current value.

        Args:
            current (float): Current matrix value to compare.
        """
        if current > self._max_matrix_value:
            self._max_matrix_value = current

        if current < self._min_matrix_value:
            self._min_matrix_value = current

    
    def add_bins_to_contacts(self, inc, start, end):
        """
        Stores all pairwise contacts implied by one SPRITE cluster.

        Args:
            inc (int): Increment value.
            start (int): Start position of the contact.
            end (int): End position of the contact.
        """
        inc_downweighted = self.get_inc(inc)

        read_bin_start = int(start) // self._resolution
        read_bin_end = int(end) // self._resolution

        # Add to the pairs.
        self._matrix[read_bin_start][read_bin_end] += inc_downweighted
        if self._chromosome_size_x == self._chromosome_size_y:
            self._matrix[read_bin_end][read_bin_start] += inc_downweighted

        # Update the max value in the matrix.
        current_matrix_value = self._matrix[read_bin_start][read_bin_end] 
        self.find_max_min_value(current_matrix_value)

    def get_min_matrix_value(self):
        """Returns the minimum matrix value."""
        return self._min_matrix_value

    def get_max_matrix_value(self):
        """Returns the maximum matrix value."""
        return self._max_matrix_value
    
    def raw_contacts(self, file_content):
        """
        Processes raw contact data to populate the contact matrix.

        Args:
            file_content (list): List of strings, each representing a line of contact data.
        """
        for line in file_content:
            start1, start2, total_inc, specific_inc = line.split(',')
            self.add_bins_to_contacts(specific_inc, start1, start2)
    

    def ice_raw_contacts(self, iterations):
        """
        Applies ICE normalization to the internal heatmap matrix.

        Args:
            iterations (int): The number of Hi-Corrector iterations to perform.
        """
        biases = self.calculate_bias_factors(iterations)
        self._min_matrix_value = 0.0
        self._max_matrix_value = 0.0

        for row in range(self._matrix.shape[0]):
            for col in range(self._matrix.shape[1]):
                val = self._matrix[row][col]
                if val > 0:
                    val /= (biases[row] * biases[col])
                    self._matrix[row][col] = val
                    self.find_max_min_value(val)
    
    def calculate_bias_factors(self, 
                               iterations):
        """
        Runs Hi-Corrector to compute bias factors for the raw contacts heatmap.

        Args:
            iterations (int): The number of Hi-Corrector iterations to perform.

        Returns:
            list: Bias factors for each row/column of the matrix.
        """

        skip_first_row = "0"    # 0 == don't skip
        skip_first_column = "0"
        num_lines = self._matrix.shape[0]

        bias_file = '../spirte-box/public/matrix_bias.txt'
        hicorrector = self.get_hicorrector_path()

        with open(os.devnull, 'w') as devnull:
            subprocess.check_call([
                hicorrector, 
                '../spirte-box/public/matrix.txt', 
                str(num_lines),
                str(iterations), 
                skip_first_row, 
                skip_first_column, 
                bias_file,
                ],
                stdout=devnull
                )
        return self.parse_bias_file(bias_file)
    
    def parse_bias_file(self, bias_file):
        """
        Parses a Hi-Corrector output file and returns the bias values as a list of floats.

        Args:
            bias_file (str): Path to the Hi-Corrector output file.

        Returns:
            list: List of bias factors.
        """

        biases = []

        with open(bias_file) as f:
            for line in f:
                biases.append(float(line.strip()))
        return biases

    def truncate_to_median_diagonal_value(self):
        """
        Scales all values in the internal heatmap matrix relative to the
        median value of the +1 and the -1 diagonals.
        """

        median_diagonal_value = self.get_median_diagonal_value()
        self._min_matrix_value = 0.0
        self._max_matrix_value = 0.0

        for row in range(self._matrix.shape[0]):
            for col in range(self._matrix.shape[1]):
                val = self._matrix[row][col]
                val = (1 if val >= median_diagonal_value
                       else val / median_diagonal_value)
                self._matrix[row][col] = val
                self.find_max_min_value(val)

    def zero_diagonal_entries(self):
        """Sets all diagonal entries in the internal heatmap matrix to zero."""

        for i in range(len(self._matrix)):
            self._matrix[i][i] = 0

    def tranform_matrix(self):
        """Transposes the internal heatmap matrix."""
        self._matrix = np.transpose(self._matrix)
    
    def get_median_diagonal_value(self):
        """
        Returns the median diagonal value of the internal heatmap matrix.

        Returns:
            float: Median value of diagonals offset by +1 and -1 from the main diagonal.
        """

        diagonal_values = []

        for i in range(self._matrix.shape[0] - 1):
            diagonal_values.append(self._matrix[i + 1][i])
            diagonal_values.append(self._matrix[i][i + 1])

        return np.median(diagonal_values)

    def save_matrix(self):
        """Saves the current matrix to a text file."""
        output_folder = '../spirte-box/public'
        os.makedirs(output_folder, exist_ok=True)
        file_path = os.path.join(output_folder, 'matrix.txt')
        np.savetxt(file_path, self._matrix, delimiter='\t', fmt='%1f')

    def get_hicorrector_path(self):
        """
        Determines the path to the Hi-Corrector executable based on the operating system.

        Returns:
            str: Path to the Hi-Corrector executable.
        """
        current_os = platform.system()

        if current_os == "Darwin":  # macOS
            hicorrector = './HiCorrector_1.2/bin-macOS/ic'
        elif current_os == "Windows":
            hicorrector = './HiCorrector_1.2/bin-Windows/ic'
        elif current_os == "Linux":
            hicorrector = './HiCorrector_1.2/bin-Linux/ic'
        else:
            hicorrector = None  # Handle unknown OS case

        return hicorrector