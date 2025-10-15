new QRCode(document.getElementById("qrcode"), {
  text: window.location.href,
  width: 150,
  height: 150,
});

const sampleData = [
  {
    roll: 'SLTC-101',
    year: '2025',
    name: 'Arjun',
    father: 'Sh. Madanpal',
    mother: 'Smt. Lata',
    course: 'ADCA', // 🟢 Course Added
    subjects: [
      {name:'Computer Fundamentals', theory:78, practical:12, theoryMax:80, practicalMax:20},
      {name:'MS Office', theory:90, practical:45, theoryMax:100, practicalMax:50}
    ]
  },
  {
    roll: 'SLCTC-102',
    year: '2025',
    name: 'Sita Verma',
    father: 'Sh. Rajesh Verma',
    mother: 'Smt. Meena Verma',
    course: 'DCA', // 🟢 Course Added
    subjects: [
      {name:'Computer Fundamentals', theory:66, practical:10, theoryMax:80, practicalMax:20},
      {name:'MS Office', theory:72, practical:8, theoryMax:80, practicalMax:20}
    ]
  },
  {
    roll: 'SLCTC-201',
    year: '2024',
    name: 'Amit Singh',
    father: 'Sh. Vinod Singh',
    mother: 'Smt. Lata Singh',
    course: 'PGDCA', // 🟢 Course Added
    subjects: [
      {name:'DCA Theory', theory:56, practical:0, theoryMax:100, practicalMax:0},
      {name:'Project', theory:64, practical:0, theoryMax:100, practicalMax:0}
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

function statusFromPct(p){
  return p >= 45 ? 'Pass' : 'Fail';
}

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

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <strong style="font-size:16px">${rec.name}</strong><br>
          <div class="meta">Roll: <strong>${rec.roll}</strong> &nbsp;|&nbsp; Year: <strong>${rec.year}</strong></div>
          <div class="meta">Course: <strong>${rec.course}</strong></div> <!-- 🟢 Course Display -->
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
            <button onclick='downloadJSON(${JSON.stringify({})})' style="background:#2a9d8f;margin-left:8px">Download JSON</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function showMessage(msg){
  document.getElementById('resultArea').innerHTML = `<div class="card"><p class="meta">${msg}</p></div>`;
}

function downloadJSON(obj){
  const a = document.createElement('a');
  const file = new Blob([JSON.stringify(obj,null,2)], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = (obj.roll||'result') + '.json';
  a.click();
}

document.getElementById('searchBtn').addEventListener('click', ()=>{
  const year = document.getElementById('yearSelect').value.trim();
  const roll = document.getElementById('rollInput').value.trim();
  if(!roll){ showMessage('Please enter a roll number.'); return; }

  const rec = sampleData.find(r=> r.roll.toLowerCase()===roll.toLowerCase() && r.year===year);
  if(!rec){ showMessage('Result not found for the provided Roll No. and Year.'); return; }

  document.getElementById('resultArea').innerHTML = renderResult(rec);
});

document.getElementById('clearBtn').addEventListener('click', ()=>{
  document.getElementById('rollInput').value = '';
  document.getElementById('resultArea').innerHTML = '';
});

document.getElementById('rollInput').addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') document.getElementById('searchBtn').click();
});
