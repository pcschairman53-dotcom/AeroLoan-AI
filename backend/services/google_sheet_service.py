import os
import json
import logging
import requests

logger = logging.getLogger(__name__)

def send_to_google_sheet(action: str, payload: dict) -> bool:
    """
    Sends data to Google Apps Script Web App using GOOGLE_SCRIPT_URL environment variable.
    """
    google_script_url = os.getenv("GOOGLE_SCRIPT_URL")
    if not google_script_url:
        logger.warning("GOOGLE_SCRIPT_URL is not configured. Skipping Google Sheet update.")
        return False

    body = {
        "action": action,
        "data": payload
    }

    try:
        response = requests.post(google_script_url, json=body, timeout=10)
        if response.status_code == 200:
            logger.info(f"Successfully logged {action} to Google Sheet.")
            return True
        else:
            logger.error(f"Failed to log {action} to Google Sheet. Status: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"Error calling Google Apps Script service: {str(e)}")
        return False


def save_application(app_data: dict) -> bool:
    """
    Appends a new application record to the 'Applications' sheet.
    """
    return send_to_google_sheet("saveApplication", app_data)


def save_prediction_history(input_data: dict, prediction_result: str) -> bool:
    """
    Appends prediction log entry to the 'Prediction History' sheet.
    """
    payload = {
        "timestamp": input_data.get("created_at") or app_data_timestamp_fallback(),
        "input_json": json.dumps(input_data),
        "prediction": prediction_result
    }
    return send_to_google_sheet("savePredictionHistory", payload)


def app_data_timestamp_fallback():
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
