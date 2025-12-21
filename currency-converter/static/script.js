const amount = document.getElementById("amount");
const from = document.getElementById("from");
const to = document.getElementById("to");
const result = document.getElementById("result");
const rateBox = document.getElementById("rate");

document.getElementById("convert").onclick = convert;
document.getElementById("swap").onclick = () => {
  [from.value, to.value] = [to.value, from.value];
  convert();
};

amount.addEventListener("keydown", e => {
  if (e.key === "Enter") convert();
});

async function convert() {
  if (!amount.value) return;

  const res = await fetch("/convert", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      amount: amount.value,
      from: from.value,
      to: to.value
    })
  });

  if (!res.ok) {
    result.textContent = "Rate limit reached.";
    return;
  }

  const data = await res.json();
  result.textContent = `${amount.value} ${from.value} = ${data.result} ${to.value}`;
  rateBox.textContent = `1 ${from.value} = ${data.rate} ${to.value}`;
}
