import numpy as np
import subprocess
import os

class Contacts:

    def __init__(self, chromosome_size_x, chromosome_size_y, resolution, downweighting):
        self._min_matrix_value = 0.0
        self._max_matrix_value = 0.0
        self._downweighting = downweighting
        self._chromosome_size_x = chromosome_size_x
        self._chromosome_size_y = chromosome_size_y
        self._resolution = int(resolution)
        self._matrix = self.init_genome_matrix()

    def init_genome_matrix(self):
        """Initializes an internal heatmap matrix with a number of rows
        determined by this object's assembly and resolution (e.g., mm9 at
        100 Mb resolution.

        This method is used for genome-wide interchromosomal heatmaps only.
        """

        num_bins_x = -(-self._chromosome_size_x // self._resolution )
        num_bins_y = -(-self._chromosome_size_y // self._resolution )
        contacts = np.zeros((num_bins_x, num_bins_y))
        print(contacts.shape)
        return contacts
    
    def get_inc(self, inc):
        """Get all the pairwise interaction calculation value"""
        if self._downweighting == "none":
            return 1.0
        elif self._downweighting == "n_minus_one":
            return 1.0 / (inc - 1)
        else:
            return 2.0 / float(inc)
        
    def find_max_min_value(self, current):
        if current > self._max_matrix_value:
            self._max_matrix_value = current

        if current < self._min_matrix_value:
            self._min_matrix_value = current

    
    def add_bins_to_contacts(self, inc, start, end):
        """Stores all pairwise contacts implied by one SPRITE cluster."""
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
        for line in file_content:
            start1, start2, total_inc, specific_inc = line.split(',')
            self.add_bins_to_contacts(specific_inc, start1, start2)
    

    def ice_raw_contacts(self, iterations):
        """Calls Hi-Corrector to apply IC normalization to the internal heatmap
        matrix.

        This method generates a file of biases by calling the ic executable,
        then scales each cell of the internal heatmap matrix by the two
        appropriate factors in that file.
 
        Args:
            raw_contacts_file (str): The file containing a raw contacts heatmap.
            bias_file (str): The path to write the Hi-Corrector output to.
            iterations (int): The number of Hi-Corrector iterations to perform.
            hicorrector_path (str): The path to the Hi-Corrector ic program.
        """

        # TODO: should allow user to choose iteration
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
        """Runs Hi-Corrector on the raw contacts heatmap.

        The bias file that Hi-Corrector outputs is subsequently read and
        returned as a list of floats.

        Note:
            Hi-Corrector cannot access the internal numpy matrix of this
            object. The matrix needs to be written to disk first, then read by
            Hi-Corrector.

        Args:
            raw_contacts_file (str): The file containing a raw contacts heatmap.
            bias_file (str): The path to write the Hi-Corrector output to.
            iterations (int): The number of Hi-Corrector iterations to perform.
            hicorrector_path (str): The path to the Hi-Corrector ic program.
        """

        skip_first_row = "0"    # 0 == don't skip
        skip_first_column = "0"
        num_lines = self._matrix.shape[0]

        bias_file = '../spirte-box/public/matrix_bias.txt'
        hicorrector = './HiCorrector_1.2/bin-macOS/ic'

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
        """Parses a Hi-Corrector ic output file and returns the values as a
        list of floats.
        """

        biases = []

        with open(bias_file) as f:
            for line in f:
                biases.append(float(line.strip()))
        return biases

    def truncate_to_median_diagonal_value(self):
        """Scales all values in the internal heatmap matrix relative to the
        median value of the +1 and the -1 diagonals (offset from main diagonal
        by +/- 1).

        If the median value is 10, a value of 3 will be scaled to 0.3 and a
        value of 9 will be scaled to 0.9. A value of 11 would be set to 1
        (since 11 > 10) rather than being set to 1.1.
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
        self._matrix = np.transpose(self._matrix)
    
    def get_median_diagonal_value(self):
        """Returns the median diagonal value of this object's internal heatmap
        matrix."

        Note:
            The median diagonal value is actually the median of the two
            diagonals offset by +1 and -1.
        """

        diagonal_values = []

        for i in range(self._matrix.shape[0] - 1):
            diagonal_values.append(self._matrix[i + 1][i])
            diagonal_values.append(self._matrix[i][i + 1])

        return np.median(diagonal_values)

    def save_matrix(self):
        output_folder = '../spirte-box/public'
        os.makedirs(output_folder, exist_ok=True)
        file_path = os.path.join(output_folder, 'matrix.txt')
        np.savetxt(file_path, self._matrix, delimiter='\t', fmt='%1f')