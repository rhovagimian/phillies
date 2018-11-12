const axios = require("axios");
const cheerio = require("cheerio");
//https://www.npmjs.com/package/minmaxpriorityqueue
const PriorityQueue = require("minmaxpriorityqueue");
//constants
const QUALIFYING_GROUP_LENGTH = 125;
const YEAR_OF_SEASON = 2016;
const LEAGUE_LEVEL = "MLB";

//https://teamcolorcodes.com/philadelphia-phillies-color-codes/
const MAROON_COLOR = "rgb(111,38,61)";
const POWDERBLUE_COLOR = "rgb(107,172,228)";
const BLACK_COLOR = "rgb(0,0,0)";

module.exports = app => {
  app.get("/", async (req, res) => {
    //pull from data source
    const response = await axios.get(
      "https://questionnaire-148920.appspot.com/swe/data.html"
    );
    //load data to cheerio
    const $ = cheerio.load(response.data);
    let playerData = [];
    //create priority queue to hold top salaries
    let qualifyingPlayers = new PriorityQueue({
      comparator: (a, b) => {
        if (typeof a == "undefined" || a == null) {
          return 1;
        }
        if (typeof b == "undefined" || b == null) {
          return -1;
        }
        return a.salary - b.salary;
      }
    });
    //loop through each player, determine if they are in qualifying group
    //and add to player list
    let totalSalary = 0;
    const playerRows = $("table#salaries-table tbody tr");
    let datasets = [];
    //add group for players with salaries in qualifying group
    const qualifyingDataset = {
      label: "Qualifying Group",
      borderColor: MAROON_COLOR,
      data: []
    };
    //add group for other players
    const nonQualifyingDataset = {
      label: "Non-Qualifying Group",
      borderColor: POWDERBLUE_COLOR,
      data: []
    };
    datasets.push(qualifyingDataset);
    datasets.push(nonQualifyingDataset);

    //loop through players and add to respective group
    let xAxisLabels = [];
    playerRows.each((i, elem) => {
      //pull player information from html
      let player = {
        rowIndex: i,
        qualifyingGroup: true,
        name: getPlayerData($(elem), "name"),
        salary: getPlayerData($(elem), "salary", "currency"),
        year: getPlayerData($(elem), "year", "number"),
        level: getPlayerData($(elem), "level")
      };

      if (player.year !== YEAR_OF_SEASON || player.level !== LEAGUE_LEVEL) {
        return;
      }

      //changed letters
      const firstLetter = player.name.charAt(0).toUpperCase();
      const sameLetter =
        playerData.length > 0 &&
        playerData[playerData.length - 1].name.charAt(0).toUpperCase() ===
          firstLetter;

      //create data point
      player.data = {
        index: playerData.length,
        label: player.name + ": " + formatCurrency(player.salary),
        x: firstLetter + (sameLetter ? i : ""),
        y: player.salary
      };
      playerData.push(player);
      xAxisLabels.push(player.data.x);

      //add player to list, add them to queue
      qualifyingPlayers.offer(player);
      qualifyingDataset.data.push(player.data);
      $(elem).addClass("qualified-group");
      totalSalary += player.salary;

      //check if we've reached our max number of players
      if (qualifyingPlayers.size() > QUALIFYING_GROUP_LENGTH) {
        //remove the top 126th player from list
        const nqPlayer = qualifyingPlayers.poll();
        //set them as not in qualifying group and remove salary from total
        nqPlayer.qualifyingGroup = false;
        totalSalary -= nqPlayer.salary;
        $(playerRows[nqPlayer.rowIndex]).addClass("non");

        //add to correct dataset
        delete qualifyingDataset.data[nqPlayer.data.index];
        nonQualifyingDataset.data.push(nqPlayer.data);
      }
    });
    //filter out the nulls
    qualifyingDataset.data = qualifyingDataset.data.filter(x => !!x);

    //calculate qualifying offer
    const qualifyingOffer = totalSalary / qualifyingPlayers.size();
    //add qualifying offer section
    const qoLabel = "Qualifying Offer: " + formatCurrency(qualifyingOffer);
    const line = {
      type: "line",
      label: qoLabel,
      borderColor: BLACK_COLOR,
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

    //return data to template
    res.render("index", {
      title: "Phillies Baseball R&D Questionnaire",
      year: YEAR_OF_SEASON,
      chartData: JSON.stringify({
        datasets,
        xAxisLabels
      }),
      salaryTable: $("table#salaries-table")
    });
  });

  function getPlayerData(elem, attr, type) {
    /*retrieve data from correction section, example:
     <td class="player-name">Abreu, Jose</td>
				<td class="player-salary">$11,666,667</td>
				<td class="player-year">2016</td>
        <td class="player-level">MLB</td>*/
    let data = elem.find(`td.player-${attr}`);
    if (!data) {
      return undefined;
    }

    if (type === "currency") {
      //https://stackoverflow.com/questions/559112/how-to-convert-a-currency-string-to-a-double-with-jquery-or-javascript
      return Number(data.text().replace(/[^0-9.-]+/g, ""));
    } else if (type === "number") {
      return Number(data.text());
    }

    return data.text();
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
};
