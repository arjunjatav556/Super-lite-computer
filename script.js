// script.js — Updated: per-student QR + deep-link via query params

// keep the existing portal QR (bottom of page)
new QRCode(document.getElementById("qrcode"), {
  text: window.location.href,
  width: 150,
  height: 150,
});

const sampleData = [
  {
    roll: 'SLTC-101',
    year: '2025',
    course: 'ADCA',
    name: 'Arjun',
    father: 'Sh. Madanpal',
    mother: 'Smt. Lata',
    subjects: [
      {name:'Computer Fundamentals', theory:78, practical:12, theoryMax:80, practicalMax:20},
      {name:'MS Office', theory:90, practical:45, theoryMax:100, practicalMax:50}
    ]
  },
  {
    roll: 'SLCTC-102',
    year: '2025',
    course: 'DCA',
    name: 'Sita Verma',
    father: 'Sh. Rajesh Verma',
    mother: 'Smt. Meena Verma',
    subjects: [
      {name:'Computer Fundamentals', theory:66, practical:10, theoryMax:80, practicalMax:20},
      {name:'MS Office', theory:72, practical:8, theoryMax:80, practicalMax:20}
    ]
  },
  {
    roll: 'SLCTC-201',
    year: '2024',
    course: 'TALLY',
    name: 'Amit Singh',
    father: 'Sh. Vinod Singh',
    mother: 'Smt. Lata Singh',
    subjects: [
      {name:'Accounting Basics', theory:75, practical:20, theoryMax:100, practicalMax:25},
      {name:'GST Project', theory:80, practical:0, theoryMax:100, practicalMax:0}
    ]
  }
];

function calcTotal(subjects){
  const theoryTotal = subjects.reduce((s,n)=>s + (Number(n.theory)||0),0);
  const practicalTotal = subjects.reduce((s,n)=>s + (Number(n.practical)||0),0);
  const theoryMax = subjects.reduce((s,n)=>s + (Number(n.theoryMax)||0),0);
  const practicalMax = subjects.reduce((s,n)=>s + (Number(n.practicalMax)||0),0);
  const total = theoryTotal + practicalTotal;
  const max = theoryMax + practicalMax;
  const pct = max ? (total / max * 100) : 0;
  return {theoryTotal, practicalTotal, theoryMax, practicalMax, total, max, pct: Math.round(pct*100)/100};
}

function gradeFromPct(p){
  if(p>=85) return 'A+';
  if(p>=75) return 'A';
  if(p>=60) return 'B';
  if(p>=45) return 'C';
  return 'F';
}
function statusFromPct(p){ return p >= 45 ? 'Pass' : 'Fail'; }
function divisionFromPct(p){
  if(p>=60) return 'First Division';
  if(p>=45) return 'Second Division';
  return 'Fail';
}

function renderResult(rec){
  const stats = calcTotal(rec.subjects);
  const grade = gradeFromPct(stats.pct);
  const status = statusFromPct(stats.pct);
  const division = divisionFromPct(stats.pct);
  const subjectsHtml = rec.subjects.map(s=>`
    <tr>
      <td>${s.name}</td>
      <td>${s.theory} / ${s.theoryMax}</td>
      <td>${s.practical} / ${s.practicalMax}</td>
    </tr>`).join('');

  // Notice the studentQrcode div — we'll put per-student QR there
  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <strong style="font-size:16px">${rec.name}</strong><br>
          <div class="meta">Roll: <strong>${rec.roll}</strong> &nbsp;|&nbsp; Year: <strong>${rec.year}</strong></div>
          <div class="meta">Course: <strong>${rec.course}</strong></div>
        </div>
        <div style="text-align:right">
          <div class="meta">Grade</div>
          <div style="font-size:20px;font-weight:700;color:var(--accent)">${grade}</div>
        </div>
      </div>

      <div class="grid">
        <div>
          <table>
            <thead><tr><th>Subject</th><th>Theory</th><th>Practical</th></tr></thead>
            <tbody>${subjectsHtml}</tbody>
          </table>
        </div>
        <div>
          <p class="meta"><strong>Father's Name:</strong> ${rec.father}</p>
          <p class="meta"><strong>Mother's Name:</strong> ${rec.mother}</p>

          <p style="margin-top:18px"><strong>Theory Total:</strong> ${stats.theoryTotal} / ${stats.theoryMax}</p>
          <p><strong>Practical Total:</strong> ${stats.practicalTotal} / ${stats.practicalMax}</p>
          <p style="margin-top:8px"><strong>Combined Total:</strong> ${stats.total} / ${stats.max}</p>
          <p><strong>Percentage:</strong> ${stats.pct}%</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Division:</strong> ${division}</p>

          <div style="margin-top:12px">
            <button onclick="window.print()">Print</button>
          </div>
        </div>
      </div>

      <!-- Per-student QR placeholder (appears under the result card) -->
      <div id="studentQrcode" style="display:flex;justify-content:center;margin-top:14px"></div>
      <div style="text-align:center;margin-top:6px;font-size:13px;color:#444">Scan to open this student's result on another device</div>
    </div>
  `;
}

function showMessage(msg){
  document.getElementById('resultArea').innerHTML = `<div class="card"><p class="meta">${msg}</p></div>`;
}

/** Generate per-student QR which deep-links back to this page with query params */
function generateStudentQR(rec){
  const qDiv = document.getElementById('studentQrcode');
  if(!qDiv) return;

  // clear previous QR if any
  qDiv.innerHTML = '';

  // build deep link URL (relative to current page)
  const base = location.origin + location.pathname;
  const params = `?roll=${encodeURIComponent(rec.roll)}&year=${encodeURIComponent(rec.year)}&course=${encodeURIComponent(rec.course)}`;
  const url = base + params;

  // create QR (size 140)
  new QRCode(qDiv, {
    text: url,
    width: 140,
    height: 140,
  });
}

/** Utility: read URL query params and return object */
function getQueryParams(){
  const search = location.search.substring(1);
  if(!search) return {};
  return Object.fromEntries(new URLSearchParams(search));
}

/** Try to auto-search if query params present (useful when opener scans QR) */
function tryAutoSearchFromURL(){
  const q = getQueryParams();
  if(q.roll && q.year && q.course){
    // fill inputs
    document.getElementById('rollInput').value = q.roll;
    document.getElementById('yearSelect').value = q.year;
    document.getElementById('courseSelect').value = q.course;

    // trigger search (same logic as click)
    performSearch(q.roll, q.year, q.course);
  }
}

/** Central search function (so can be called from auto-search too) */
function performSearch(roll, year, course){
  // normalize
  const r = roll.trim();
  const y = year.trim();
  const c = course.trim();

  if(!r){
    showMessage('Please enter a roll number.');
    return;
  }
  if(!c){
    showMessage('Please select a course.');
    return;
  }

  const rec = sampleData.find(item =>
    item.roll.toLowerCase() === r.toLowerCase() &&
    item.year === y &&
    item.course === c
  );

  if(!rec){
    showMessage('Result not found for the provided Roll No., Year or Course.');
    // also clear any leftover student QR
    const qDiv = document.getElementById('studentQrcode');
    if(qDiv) qDiv.innerHTML = '';
    return;
  }

  // render and then generate student QR
  document.getElementById('resultArea').innerHTML = renderResult(rec);
  generateStudentQR(rec);
}

/** Event handlers */
document.getElementById('searchBtn').addEventListener('click', ()=>{
  const year = document.getElementById('yearSelect').value.trim();
  const roll = document.getElementById('rollInput').value.trim();
  const course = document.getElementById('courseSelect').value.trim();
  performSearch(roll, year, course);
});

document.getElementById('clearBtn').addEventListener('click', ()=>{
  document.getElementById('rollInput').value = '';
  document.getElementById('resultArea').innerHTML = '';
  // clear any student QR that might be outside resultArea (safety)
  const qDiv = document.getElementById('studentQrcode');
  if(qDiv) qDiv.innerHTML = '';
});

document.getElementById('rollInput').addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') document.getElementById('searchBtn').click();
});

// On page load, try to auto-search if URL has query params
window.addEventListener('load', tryAutoSearchFromURL);
