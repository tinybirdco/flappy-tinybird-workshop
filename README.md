<p>
  <a href="https://www.tinybird.co/join-our-slack-community"><img alt="Slack Status" src="https://img.shields.io/badge/slack-chat-1FCC83?style=flat&logo=slack"></a>
</p>

# <img src="public/bird.png" alt="tinybird" width="25"/> Let's Play: Flappybird

Welcome to the Flappybird Workshop! The purpose of this workshop is to demonstrate the power of real-time analytics by revamping the analytical backend of the popular game, Flappybird.

You will build 2 real-time analytics use cases:
1. **User-facing analytics** to improve the gamer experience.

2. **Real-time personalization** to drive the monetization strategy in the game.

This repository contains a clone of Flappybird. It was built using the Phaser 3 game framework, JavaScript, and [Tinybird](https://www.tinybird.co/), the real-time data platform for data and engineering teams.

## Play the game!

Test your skills by playing 🎮🐥 [Flappy Tinybird](https://tbrd.co/flappybird)!

The goal of the game is to maneuver the bird through a challenging array of pipes, avoiding any collisions. The bird propels itself forward automatically, and you control its flight by either pressing the space bar, enter, or clicking on the screen to flap its wings. If you collide with a pipe, the ground, or the sky, it's game over!

## Create a Tinybird Workspace

To build real-time analytics into the game, you'll need to set up a Tinybird Workspace. Follow these steps:
1. Click [this link](https://ui.us-east.tinybird.co/workspaces/new?name=adc_workshop) to create a Tinybird Workspace.

2. If prompted, log in or create a Tinybird account.

3. Give your Workspace a unique name.

4. Under **Starter kit**, select `None - Empty Workspace`.

5. Click **Create Workspace**.

Your Tinybird Workspace is set up and ready for action!

## Generate Dummy Data

Now that you have a Workspace, you need to ingest a data stream. 
1. In this repo, navigate to `/tinybird/datasources` and download the file `events_api.datasource`. This is the schema of your Data Source.

2. Drag and drop the file into the Tinybird UI. Click `Import 1 resource` to import the Data Source.

3. That also created a new token to authorize append requests to the Data Source. In Tinybird, go to `Tokens` in the left navigation pane, select `app_append_token`, and click the `copy` icon to copy the token.

4. To generate dummy data, you will use the open source tool Mockingbird to stream data to Tinybird's [Events API](https://www.tinybird.co/docs/ingest/events-api), an easy-to-use HTTP API that enables high-throughput streaming ingestion. Launch [Mockingbird](https://mockingbird.tinybird.co/?host=us_gcp&datasource=events_api&token=&eps=200&withLimit=on&limit=1000000&generator=Tinybird&endpoint=us_gcp&generatorName=Tinybird&template=Flappybird&schema=Preset), go to `Settings`, paste your token in the `Data Source API Token` input, and click `Save`.

5. Scroll down and click `Preview` to see a sample message. Then, scroll further and click `Start Generating!` to stream data to Tinybird.

6. Return to Tinybird, navigate to the `events_api` Data Source, and confirm that data is being ingested.

In just a few clicks, you set up streaming ingestion into Tinybird!

## Build API Endpoints

Now that a data stream is flowing into Tinybird, the next step is to develop over that data using SQL and publish API Endpoints. You do that in Pipes.

### User-Facing Analytics

For the first use case, you will build a user-facing analytics use case: an API that returns the top 10 scores 🏆 in a global leaderboard.

Click the **+** icon next to the Data Project section on the left navigation and select **Pipe**.
1. Rename the pipe to `api_leaderboard`.

2. In the first node (SQL editor), copy and paste this query:
```
SELECT name AS player_id, session_id FROM events_api WHERE type = 'score'
```

3. Run the query and rename the node to `filter_data`.

4. Scroll down to the new transformation node. Copy and paste this query:
```
SELECT player_id, session_id, count() AS score
FROM filter_data
GROUP BY player_id, session_id
ORDER BY score DESC
LIMIT 10
```

5. Run the query and rename the node to `aggregate`.

6. Once you completed the query, click **Create API Endpoint** in the top right corner and select the `aggregate` node.

🎉 BOOM! 🎉 You just went from a data stream to a production-ready API Endpoint in minutes.

Copy the URL from the sample usage section and paste it into a new tab to make an API request. Go back to Tinybird and check out the usage metrics (you may need to wait a second or refresh the page).

> _Note_: This query was split into two nodes to demonstrate the notebook-style UX of Pipes, designed to simplify and accelerate your development. You can decide if you’d like to use one or multiple nodes; the Pipe is still executed as a single query.

### Real-time personalization

For the second use case, you will build a real-time personalization use case: an API that determines whether or not a player receives an offer 💸 based on their performance.

Click the **+** icon next to the Data Project section on the left navigation and select **Pipe**.
1. Rename the pipe to `api_personalization`.

2. Since you’re already a Tinybird expert 🥇, try writing this query by yourself! The query should work like this:

In the _last hour_, if a player _played 3 or more games_, scored _less than or equal to 15 points_, and made _0 purchases_, **return 1** (player receives an offer because they are struggling). Else, **return 0** (player does not receive an offer).

3. Here are some tips:

- All queries in the UI are free, so explore your data! Create Playgrounds (on the left navigation) to avoid cluttering your Workspace with Pipes.  
- Split your logic into multiple nodes and follow the [5 rules of fast queries](https://www.tinybird.co/docs/guides/best-practices-for-faster-sql.html#the-5-rules-of-fast-queries).  
- Filter on a specific player name to start. Then, make it a dynamic filter with a [query parameter](https://www.tinybird.co/docs/query/query-parameters.html).  
- Use the `uniq()` function to mimic a distinct count.  
- Use the `countIf()` function to perform a count with a conditional.  

4. Once you have completed the query, publish the desired node as an API Endpoint.

🎉 Nice work! You developed another use case that can be used to drive the monetization strategy of the game.

Copy the URL from the sample usage section and paste it into a new tab to make an API request. Go back to Tinybird and check out the usage metrics (you may need to wait a second or refresh the page).

## Challenge: Optimize with Materialized Views

Both Endpoints query the raw data from the `events_api` Data Source. The queries are performant with a few thousand rows, but as your data scales up to millions or billions of rows, query performance will likely degrade.

A powerful way to optimize your queries in Tinybird is through [Materialized Views](https://www.tinybird.co/docs/guides/materialized-views.html), which let you pre-aggregate and pre-filter large Data Sources incrementally, adding simple logic using SQL to produce a more relevant Data Source with significantly fewer rows.

Put simply, Materialized Views shift computational load from query time to ingestion time, so your endpoints stay blazing ⚡️ fast.

Check out the guide linked above and refactor your queries using Materialized Views. Here are some tips:

- A typical Materialized View 'flow' in Tinybird consists of 3 resources: (1) a Pipe to materialize data into (2) a target Data Source, and (3) a Pipe to query from that Data Source and publish as an API.
- You create Materialized Views the same way you create API Endpoints. But instead of clicking 'Create API Endpoint', try clicking on the arrow next to it.
- Avoid dynamic filters (like a time filter on the last hour) in the 'materializing Pipe'; they may not work as you expect because of the nature of Materialized Views in Tinybird.
- Data in Materialized Views exists in intermediate states. When _creating_ a Materialized View, you need to add the `-State()` modifier to aggregate functions (e.g. `countState()`). When querying _from_ the Materialized View, you need to reaggregate and merge the intermediate states with the `-Merge()` modifier. 
- If you need help, the answer can be found in `/tinybird/pipes/mat_player_stats.pipe`, `/tinybird/endpoints/api_leaderboard.pipe`, and `/tinybird/endpoints/api_personalization.pipe`

> _Note_: Materialized Views are often used to improve performance by reducing the size of a Data Source by an order of magnitude. In this workshop, the volume of data may not be great enough to make a significant difference in performance. See a detailed example [here](https://www.tinybird.co/docs/guides/materialized-views.html#creating-a-materialized-view-in-the-tinybird-ui).

## Workshop wrap-up

With only a few clicks and a few lines of SQL, you built user-facing analytics to improve the player experience and real-time personalization to drive revenue.

Explore the rest of this repository to see how the entire project fits together. Happy flapping!

---

<<<<<<<NEED TO UPDATE THE LINKS - DECIDE IF THEY SHOULD GO TO THE ROOT REPO OR THE WORKSHOP ONE>>>>>>>>

## Run the Game Locally

To run your own version of the game, you'll need to create a Tinybird Workspace and install Node.js and npm on your computer.

1. [Sign up for Tinybird](https://ui.tinybird.co/signup) and follow the guided process to create an empty Workspace in the provider/region of your choosing.

2. Clone this repository locally

```bash
git clone https://github.com/tinybirdco/flappy-tinybird.git
cd flappy-tinybird
```

3. Install dependencies

```bash
npm install
```

4. Install and configure the Tinybird CLI

> Note: Alternatively, you can sync your Tinybird Workspace with a remote Git repository. Go to [Tinybird's docs](https://www.tinybird.co/docs/version-control/introduction.html) to learn more.

First, install the Tinybird CLI in a virtual environment. You'll need Python 3 installed.

Check the [Tinybird CLI documentation](https://docs.tinybird.co/cli.html) for other installation options and troubleshooting tips.

```bash
cd tinybird/
python3 -mvenv .e
. .e/bin/activate
pip install tinybird-cli
tb auth --interactive
```

In the Tinybird UI, navigate to Tokens page in the left navigation pane and copy the token with admin rights. Paste it in the terminal and hit enter/return.

> ⚠️Warning! This is your admin token. Don't share it or publish it in your application. You can manage your tokens via API or using the Auth Tokens section in the UI. More detailed info at [Auth Tokens management](https://www.tinybird.co/docs/api-reference/token-api.html).

Choose your region. A new `.tinyb` file will be created in the `tinybird/` folder.

5. Push the Data Project to your Tinybird Workspace

```bash
tb push
```

All of the Data Sources, Pipes, and Tokens are now available in your Tinybird Workspace.

6. Add Tinybird variables to the `.env` file

Duplicate the `.env.example` file and change the extension to `.env`.

Back in the Tinybird UI, navigate to the Tokens page. copy the tokens `app_read_token` and `app_append_token` and paste them in the `.env` file. You will also need to add the host (refer to the URL to select the correct region).

```
VITE_TINYBIRD_HOST=api.[us-east. | us-east.aws. | eu-central-1.aws.]tinybird.co
VITE_TINYBIRD_READ_TOKEN=[app_read_token]
VITE_TINYBIRD_APPEND_TOKEN=[app_append_token]
```

7. Start the game!

In the terminal, run the following command:

```bash
npm start
```

Open your web browser, go to `http://localhost:3000`, and play!

## Credits

This game was built by [Joe Karlsson](https://github.com/JoeKarlsson), [Alasdair Brown](https://github.com/sdairs), [Joe Krawiec](https://github.com/simply-joe), [David Margulies](https://github.com/davidnmargulies), [Rafa Moreno](https://github.com/rmorehig), [Julia Vallina](https://github.com/juliavallina), and [Juanma Jimenez](https://github.com/juanma-tinybird) based on the original game by Dong Nguyen.

## License

This project is licensed under the MIT License.