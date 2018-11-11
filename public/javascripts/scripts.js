//https://teamcolorcodes.com/philadelphia-phillies-color-codes/
const MAROON_COLOR = "rgb(111,38,61)";
const POWDERBLUE_COLOR = "rgb(107,172,228)";
const BLACK_COLOR = "rgb(0,0,0)";

function getChartData(players, qualifyingOffer) {
  let datasets = [];
  const qualifyingGroup = {
    label: "Qualifying Group",
    borderColor: MAROON_COLOR,
    backgroundColor: Chart.helpers
      .color(MAROON_COLOR)
      .alpha(0.2)
      .rgbString(),
    data: []
  };
  const nonQualifyingGroup = {
    label: "Non-Qualifying Group",
    borderColor: POWDERBLUE_COLOR,
    backgroundColor: Chart.helpers
      .color(POWDERBLUE_COLOR)
      .alpha(0.2)
      .rgbString(),
    data: []
  };
  datasets.push(qualifyingGroup);
  datasets.push(nonQualifyingGroup);

  let xAxisLabels = [];

  players.forEach((player, index) => {
    //changed letters
    const sameLetter =
      index > 0 &&
      players[index - 1].name.charAt(0).toUpperCase() ===
        player.name.charAt(0).toUpperCase();

    let data = {
      label: player.name + ": " + formatCurrency(player.salary),
      x: player.name.charAt(0).toUpperCase() + (sameLetter ? index : ""),
      y: player.salary
    };

    if (player.qualifyingGroup) {
      qualifyingGroup.data.push(data);
    } else {
      nonQualifyingGroup.data.push(data);
    }

    xAxisLabels.push(data.x);
  });
  const qoLabel = "Qualifying Offer: " + formatCurrency(qualifyingOffer);
  const line = {
    type: "line",
    label: qoLabel,
    borderColor: BLACK_COLOR,
    backgroundColor: Chart.helpers
      .color(BLACK_COLOR)
      .alpha(0.2)
      .rgbString(),
    fill: false,
    showLine: true,
    data: [
      {
        label: qoLabel,
        x: xAxisLabels[0],
        y: qualifyingOffer
      },
      {
        label: qoLabel,
        x: xAxisLabels[xAxisLabels.length - 1],
        y: qualifyingOffer
      }
    ]
  };
  datasets.push(line);
  console.log(xAxisLabels);
  return {
    datasets,
    xAxisLabels
  };
}

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
    console.log(e);
  }
}
