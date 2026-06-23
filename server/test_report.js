async function test() {
  const res = await fetch('http://localhost:5000/api/finance/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ngoId: "64f1b2b3c4d5e6f7a8b9c0d1",
      title: "Test Report",
      rows: [
        { particulars: "Test 1", expense: "100" }
      ],
      bills: []
    })
  });
  const data = await res.json();
  console.log(res.status, data);
}

test();
