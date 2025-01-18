"""
Author: Jes Kwek Hui Min
Description: Flask API for processing SPRITE contact matrix data. The API provides endpoints for processing 
SPRITE data files, generating matrices, and handling metadata. It supports raw, ICE normalization, Final output types.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from contact import Contacts

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def get_chromosome_number(chromosome):
    """
    Convert chromosome identifier to a number for comparison.
    
    Parameters:
    chromosome (str): Chromosome identifier (e.g., 'chr1', 'chrX').

    Returns:
    int: Numeric representation of the chromosome.
    """
    return int(chromosome.replace('chr', ''))

CHROMOSOMES_SIZE = {}

@app.route('/matrix', methods=['POST'])
def get_hic_data():
    """
    Endpoint to process SPRITE data and generate a contact matrix.
    
    Request data:
    - meta: JSON file containing chromosome sizes.
    - chr: File containing Hi-C raw contact data.
    - xAxis, yAxis: Chromosomes to be analyzed.
    - resolution: Desired resolution for the contact matrix.
    - output-type: Type of output (e.g., 'raw', 'iced').
    - ice-iteration: Number of iterations for ICE normalization.
    - down-weighting: Down-weighting factor for normalization.

    Returns:
    JSON response with min and max values of the matrix, and success status.
    """
    metafile = request.files.getlist('meta')[0]
    file_content = metafile.read()
    CHROMOSOMES_SIZE = json.loads(file_content)
    chrfile = request.files.getlist('chr')[0]
    xAxis = request.form.getlist('xAxis')[0]
    yAxis = request.form.getlist('yAxis')[0]
    resolution = request.form.getlist('resolution')[0]
    output_type = request.form.getlist('output-type')[0]
    ice_iteration = request.form.getlist('ice-iteration')[0]
    down_weighting = request.form.getlist('down-weighting')[0]

    file_content = chrfile.read().decode('utf-8').splitlines()

    # Determine if the matrix transformation is required based on chromosome comparison
    isTransformRequired = False

    if (get_chromosome_number(xAxis) > get_chromosome_number(yAxis)):
        isTransformRequired = True
        temp = xAxis
        xAxis = yAxis
        yAxis = temp

    # Retrieve sizes of the specified chromosomes
    x_size = CHROMOSOMES_SIZE['chromosomes'][xAxis]
    y_size = CHROMOSOMES_SIZE['chromosomes'][yAxis]

    contacts = Contacts(
        x_size,
        y_size,
        resolution,
        down_weighting)    

    contacts.raw_contacts(file_content)

    if x_size == y_size:
        contacts.zero_diagonal_entries()

    if isTransformRequired:
        contacts.tranform_matrix()

    contacts.save_matrix()

    if output_type == 'raw':
        return jsonify({
            'isSucess': True,
            'min_value': contacts.get_min_matrix_value(),
            'max_value': contacts.get_max_matrix_value()
            }), 200
    
    contacts.ice_raw_contacts(ice_iteration)

    if output_type == 'iced':
        contacts.save_matrix()
        return jsonify({
            'isSucess': True,
            'min_value': contacts.get_min_matrix_value(),
            'max_value': contacts.get_max_matrix_value()
            }), 200
    
    contacts.truncate_to_median_diagonal_value()
    contacts.save_matrix()

    print("COMPLETED")
        
    return jsonify({
            'isSucess': True,
            'min_value': contacts.get_min_matrix_value(),
            'max_value': contacts.get_max_matrix_value()
            }), 200
    
@app.route('/meta', methods=['POST'])
def upload_files():
    """
    Endpoint to upload and parse a JSON file containing metadata.

    Request data:
    - files: JSON file containing metadata.

    Returns:
    JSON response containing the parsed data or an error message.
    """
    file = request.files.getlist('files')[0]

    try:
        file_content = file.read()
        data = json.loads(file_content)
        return jsonify(json.dumps(data)), 200
    except json.JSONDecodeError as e:
        print(f"Error reading {file.filename}: {e}")
        return jsonify({"error": "Invalid JSON file"}), 400


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5500)
