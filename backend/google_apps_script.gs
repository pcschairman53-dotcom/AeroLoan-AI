/**
 * Google Apps Script Web App for Loan Approval AI
 * 
 * Deployment Setup:
 * 1. Open Google Sheets -> Extensions -> Apps Script
 * 2. Paste this entire code into Code.gs
 * 3. Click Deploy -> New Deployment
 * 4. Select type: Web app
 * 5. Set 'Execute as': Me
 * 6. Set 'Who has access': Anyone
 * 7. Copy Web App URL and add to Render environment variables as GOOGLE_SCRIPT_URL
 */

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var data = contents.data;

    if (action === "saveApplication") {
      saveApplication(data);
    } else if (action === "savePredictionHistory") {
      savePredictionHistory(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ "success": true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "success": false, "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(sheetName, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }
  }
  return sheet;
}

function saveApplication(data) {
  var headers = [
    "Created At", "Gender", "Married", "Dependents", "Education",
    "Self Employed", "Credit History", "Property Area", "Loan Amount Term",
    "Applicant Income", "Coapplicant Income", "Loan Amount", "Prediction"
  ];
  var sheet = getOrCreateSheet("Applications", headers);

  var row = [
    data.created_at || new Date().toISOString(),
    data.gender || "",
    data.married || "",
    data.dependents || "",
    data.education || "",
    data.self_employed || "",
    data.credit_history !== undefined ? data.credit_history : "",
    data.property_area || "",
    data.loan_amount_term !== undefined ? data.loan_amount_term : "",
    data.applicant_income || 0,
    data.coapplicant_income || 0,
    data.loan_amount || 0,
    data.prediction || ""
  ];

  sheet.appendRow(row);
}

function savePredictionHistory(data) {
  var headers = ["Timestamp", "Input JSON", "Prediction"];
  var sheet = getOrCreateSheet("Prediction History", headers);

  var row = [
    data.timestamp || new Date().toISOString(),
    typeof data.input_json === "string" ? data.input_json : JSON.stringify(data.input_json || {}),
    data.prediction || ""
  ];

  sheet.appendRow(row);
}
