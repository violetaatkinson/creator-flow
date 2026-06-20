import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const getMonthIndex = (dateStr) => {
  if (!dateStr) return -1;
  return MONTHS.findIndex(m => dateStr.toLowerCase().includes(m.toLowerCase()));
};

export const generateReport = async (period, userName) => {
  try {
    const uid = auth.currentUser.uid;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const [campSnap, expSnap] = await Promise.all([
      getDocs(query(collection(db, "campaigns"), where("userId", "==", uid))),
      getDocs(query(collection(db, "expenses"), where("userId", "==", uid))),
    ]);
    const campaigns = campSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const expenses = expSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    let filteredCampaigns = campaigns.filter(c => c.status === "Completed" || c.status === "Active");
    let filteredExpenses = expenses;
    let periodLabel = "";

    if (period === "month") {
      periodLabel = `${MONTHS[currentMonth]} ${currentYear}`;
      filteredCampaigns = filteredCampaigns.filter(c => getMonthIndex(c.date) === currentMonth);
      filteredExpenses = filteredExpenses.filter(e => e.month === currentMonth + 1 && e.year === currentYear);
    } else if (period === "semester") {
      const months = Array.from({ length: 6 }, (_, i) => (currentMonth - i + 12) % 12);
      periodLabel = `Last 6 months — ${currentYear}`;
      filteredCampaigns = filteredCampaigns.filter(c => months.includes(getMonthIndex(c.date)));
      filteredExpenses = filteredExpenses.filter(e => months.includes((e.month - 1 + 12) % 12) && e.year === currentYear);
    } else {
      periodLabel = `Year ${currentYear}`;
      filteredExpenses = filteredExpenses.filter(e => e.year === currentYear);
    }

    const totalIncome = filteredCampaigns.reduce((sum, c) => sum + c.payment, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const net = totalIncome - totalExpenses;

    const campaignRows = filteredCampaigns.map(c => `
      <tr>
        <td>${c.brand}</td><td>${c.platform}</td><td>${c.type}</td>
        <td>${c.date || "—"}</td>
        <td style="color:#4ade80">+$${c.payment}</td>
        <td>${c.status}</td>
      </tr>
    `).join("");

    const expenseRows = filteredExpenses.map(e => `
      <tr>
        <td>${e.description}</td><td>${e.category}</td>
        <td>${e.date || "—"}</td>
        <td style="color:#f87171">-$${e.amount}</td>
      </tr>
    `).join("");

    const html = `
      <html><head><meta charset="utf-8"/>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
        h1 { font-size: 28px; margin-bottom: 4px; }
        h2 { font-size: 16px; font-weight: normal; color: #666; margin-bottom: 32px; }
        h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin: 24px 0 8px; }
        .kpis { display: flex; gap: 16px; margin-bottom: 32px; }
        .kpi { flex: 1; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; }
        .kpi-label { font-size: 11px; text-transform: uppercase; color: #888; }
        .kpi-value { font-size: 24px; font-weight: bold; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 8px 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; color: #888; }
        td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
        .footer { margin-top: 48px; font-size: 11px; color: #aaa; text-align: center; }
      </style></head>
      <body>
        <h1>Creator Flow — Report</h1>
        <h2>${periodLabel} · ${userName || auth.currentUser.email}</h2>
        <div class="kpis">
          <div class="kpi"><div class="kpi-label">Income</div><div class="kpi-value" style="color:#4ade80">$${totalIncome}</div></div>
          <div class="kpi"><div class="kpi-label">Expenses</div><div class="kpi-value" style="color:#f87171">-$${totalExpenses}</div></div>
          <div class="kpi"><div class="kpi-label">Net</div><div class="kpi-value" style="color:${net >= 0 ? "#4ade80" : "#f87171"}">$${net}</div></div>
          <div class="kpi"><div class="kpi-label">Campaigns</div><div class="kpi-value">${filteredCampaigns.length}</div></div>
        </div>
        <h3>Campaigns</h3>
        <table>
          <thead><tr><th>Brand</th><th>Platform</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>${campaignRows || "<tr><td colspan='6' style='color:#aaa;text-align:center;padding:20px'>No campaigns</td></tr>"}</tbody>
        </table>
        <h3>Expenses</h3>
        <table>
          <thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th></tr></thead>
          <tbody>${expenseRows || "<tr><td colspan='4' style='color:#aaa;text-align:center;padding:20px'>No expenses</td></tr>"}</tbody>
        </table>
        <div class="footer">Generated by Creator Flow · ${now.toLocaleDateString()}</div>
      </body></html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  } catch (e) {
    throw new Error("Could not generate report: " + e.message);
  }
};