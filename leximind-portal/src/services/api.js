/* ============================================================================
   API SERVICE LAYER — CONNECTED TO DJANGO BACKEND
   -----------------------------------------------------------------------
   All requests forward the JWT access token from sessionStorage.
   List endpoints unpack the DRF paginated { results } shape so components
   don't need to change.
============================================================================ */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

function getToken() {
  try {
    const raw = sessionStorage.getItem("leximind_secure_session");
    if (!raw) return null;
    return JSON.parse(raw).access;
  } catch {
    return null;
  }
}

async function fetchAPI(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token && !options.noAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errDetail = "API Error";
    try {
      const data = await response.json();
      errDetail = data.detail || JSON.stringify(data);
    } catch (e) {
      errDetail = response.statusText;
    }
    throw new Error(errDetail);
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

/** 
 * Unpack DRF paginated responses ({ count, next, previous, results }) 
 * so the frontend gets the array it expects.
 */
function unpackResults(data) {
  if (data && Array.isArray(data.results)) {
    return data.results;
  }
  return data;
}

// ---- /api/admin

export async function getUsers() {
  const res = await fetchAPI("/admin/users/");
  return unpackResults(res);
}

// ---- /api/auth ----------------------------------------------------------
export async function login(username, password) {
  return fetchAPI("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    noAuth: true,
  });
}



export async function logout(refreshToken) {
  if (!refreshToken) return;
  return fetchAPI("/auth/logout/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  });
}

export async function getMe() {
  return fetchAPI("/auth/me/");
}

export async function register(userData) {
  return fetchAPI("/auth/register/", {
    method: "POST",
    body: JSON.stringify(userData),
    noAuth: true,
  });
}

// ---- /api/cases -----------------------------------------------------------
export async function getCases() { 
  const res = await fetchAPI("/cases/"); 
  return unpackResults(res);
}


export async function createCase(caseData) {
  return fetchAPI("/cases/", {
    method: "POST",
    body: JSON.stringify(caseData),
  });
}

export async function getCase(caseId) { 
  return fetchAPI(`/cases/${caseId}/`); 
}

// ---- /api/documents ---------------------------------------------------
export async function getDocuments(filter = {}) {
  const query = filter.caseId ? `?caseId=${filter.caseId}` : "";
  const res = await fetchAPI(`/documents/${query}`);
  return unpackResults(res);
}


export async function uploadDocument(formData) {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/documents/upload/`, {
    method: "POST",
    body: formData,
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function getUploadStatus(pipelineId) {
  return fetchAPI(`/documents/upload/${pipelineId}/status/`);
}

export async function getDocument(docId) { 
  return fetchAPI(`/documents/${docId}/`); 
}

// ---- /api/evidence ------------------------------------------------------
export async function getEvidence(filter = {}) {
  const query = filter.caseId ? `?caseId=${filter.caseId}` : "";
  const res = await fetchAPI(`/evidence/${query}`);
  return unpackResults(res);
}

// ---- /api/custody -------------------------------------------------------
export async function getCustodyEvents(filter = {}) {
  const query = filter.caseId ? `?caseId=${filter.caseId}` : "";
  const res = await fetchAPI(`/custody/events/${query}`);
  return unpackResults(res);
}

export async function requestCustodyTransfer(data) {
  return fetchAPI("/custody/transfers/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function approveTransfer(transferId) {
  return fetchAPI(`/custody/transfers/${transferId}/approve/`, {
    method: "POST",
  });
}

export async function rejectTransfer(transferId) {
  return fetchAPI(`/custody/transfers/${transferId}/reject/`, {
    method: "POST",
  });
}

// ---- /api/blockchain ------------------------------------------------------
export async function getBlockchainRecords() { 
  const res = await fetchAPI("/blockchain/records/"); 
  return unpackResults(res);
}

export async function verifyHash(documentId) {
  return fetchAPI("/blockchain/verify/", {
    method: "POST",
    body: JSON.stringify({ documentId }),
  });
}

// ---- /api/audit -------------------------------------------------------------
export async function getAuditLog() { 
  const res = await fetchAPI("/audit/log/");
  return unpackResults(res);
}

export async function getSecurityAlerts() { 
  const res = await fetchAPI("/alerts/");
  return unpackResults(res);
}

// ---- /api/ai ------------------------------------------------------------
export async function getAIInsights(docId) { 
  try {
    return await fetchAPI(`/ai/documents/${docId}/insights/`);
  } catch (err) {
    if (err.message.includes("not found")) return null;
    throw err;
  }
}

export async function askCaseQuestion(caseId, question) {
  return fetchAPI(`/ai/cases/${caseId}/qa/ask/`, {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

export default {
  login, register, logout, getMe, getUsers, getCases, createCase, getCase, getDocuments, uploadDocument, getUploadStatus, getDocument, getEvidence, getCustodyEvents, requestCustodyTransfer, approveTransfer, rejectTransfer,
  getBlockchainRecords, verifyHash, getAuditLog, getSecurityAlerts, getAIInsights, askCaseQuestion,
};
