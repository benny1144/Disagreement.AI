import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from crew import create_disagreement_crew # We import our crew creation function

# Load environment variables
load_dotenv()

# Initialize the Flask application
app = Flask(__name__)

@app.route('/process_disagreement', methods=['POST'])
def process_disagreement_endpoint():
    """
    API endpoint to process a disagreement.
    Expects a JSON payload with a "dispute_text" key and an optional "mode" key.
    """
    data = request.get_json()
    if not data or 'dispute_text' not in data:
        return jsonify({"error": "Missing 'dispute_text' in request body"}), 400

    dispute_text = data['dispute_text']
    mode = data.get('mode', 'mediation')

    # Validate mode if provided
    allowed_modes = {"mediation", "debate", "team_building"}
    if mode not in allowed_modes:
        return jsonify({
            "error": "Invalid mode specified. Must be one of: mediation, debate, team_building"
        }), 400

    # Branch logic based on mode
    if mode in ("debate", "team_building"):
        return jsonify({
            "status": "beta",
            "message": "This feature is coming soon and will be available after our initial launch."
        }), 200

    # Default and mediation path
    try:
        crew = create_disagreement_crew(dispute_text)
        result = crew.kickoff()
        return jsonify({"resolution": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True, port=5001)