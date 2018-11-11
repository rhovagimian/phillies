//https://teamcolorcodes.com/philadelphia-phillies-color-codes/
const MAROON_COLOR = "rgb(111,38,61)";
const POWDERBLUE_COLOR = "rgb(107,172,228)";
const BLACK_COLOR = "rgb(0,0,0)";

function getChartData(players, qualifyingOffer) {
  let datasets = [];
  //add group for players with salaries in qualifying group
  const qualifyingGroup = {
    label: "Qualifying Group",
    borderColor: MAROON_COLOR,
    backgroundColor: Chart.helpers
      .color(MAROON_COLOR)
      .alpha(0.2)
      .rgbString(),
    data: []
  };
  //add group for other players
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

  //loop through players and add to respective group
  let xAxisLabels = [];
  players.forEach((player, index) => {
    //changed letters
    const firstLetter = player.name.charAt(0).toUpperCase();
    const sameLetter =
      index > 0 &&
      players[index - 1].name.charAt(0).toUpperCase() === firstLetter;

    //create data point
    const data = {
      label: player.name + ": " + formatCurrency(player.salary),
      x: firstLetter + (sameLetter ? index : ""),
      y: player.salary
    };

    //add to correct group
    if (player.qualifyingGroup) {
      qualifyingGroup.data.push(data);
    } else {
      nonQualifyingGroup.data.push(data);
    }

    xAxisLabels.push(data.x);
  });

  //add qualifying offer section
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
    return;
  }
}
