const axios = require("axios");
const cheerio = require("cheerio");
//https://www.npmjs.com/package/minmaxpriorityqueue
const PriorityQueue = require("minmaxpriorityqueue");
const QUALIFYING_GROUP = 125;
const YEAR_OF_SEASON = 2016;
const LEAGUE_LEVEL = "MLB";

module.exports = app => {
  app.get("/", async (req, res) => {
    //pull from data source
    const response = await axios.get(
      "https://questionnaire-148920.appspot.com/swe/data.html"
    );
    //load data to cheer
    const $ = cheerio.load(response.data);
    let playerData = [];
    /* <td class="player-name">Abreu, Jose</td>
				<td class="player-salary">$11,666,667</td>
				<td class="player-year">2016</td>
        <td class="player-level">MLB</td>*/
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
    let totalSalary = 0;

    const playerRows = $("table#salaries-table tbody tr");
    playerRows.each((i, elem) => {
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

      playerData.push(player);
      qualifyingPlayers.offer(player);
      $(elem).addClass("qualified-group");
      totalSalary += player.salary;
      if (qualifyingPlayers.size() > QUALIFYING_GROUP) {
        const nqPlayer = qualifyingPlayers.poll();
        nqPlayer.qualifyingGroup = false;
        totalSalary -= nqPlayer.salary;
        $(playerRows[nqPlayer.rowIndex]).addClass("non");
      }
    });
    const qualifyingOffer = totalSalary / QUALIFYING_GROUP;

    res.render("index", {
      year: YEAR_OF_SEASON,
      playerData: JSON.stringify(playerData),
      qualifyingOffer,
      salaryTable: $("table#salaries-table")
    });
  });

  function getPlayerData(elem, attr, type) {
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
};
