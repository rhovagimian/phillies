function getTooltipLabel(tooltipItem, data) {
  return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].label;
}

function formatYAxis(value, index, values) {
  return formatCurrency(value, 0);
}

//https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
function formatCurrency(
  amount,
  decimalCount = 2,
  decimal = ".",
  thousands = ",",
  indicator = "$"
) {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(
      (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
    ).toString();
    let j = i.length > 3 ? i.length % 3 : 0;

    return (
      indicator +
      (negativeSign +
        (j ? i.substr(0, j) + thousands : "") +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
        (decimalCount
          ? decimal +
            Math.abs(amount - i)
              .toFixed(decimalCount)
              .slice(2)
          : ""))
    );
  } catch (e) {
    return;
  }
}
