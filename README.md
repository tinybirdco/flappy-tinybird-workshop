<p>
  <a href="https://www.tinybird.co/join-our-slack-community"><img alt="Slack Status" src="https://img.shields.io/badge/slack-chat-1FCC83?style=flat&logo=slack"></a>
</p>

# <img src="public/bird.png" alt="tinybird" width="25"/> Let's Play! Flappybird

Welcome to the Flappybird Workshop! The purpose of this workshop is to demonstrate the power of real-time analytics by revamping the analytical backend of the popular game, Flappybird.

You will build 2 real-time analytics use cases:
1. **User-facing analytics** to improve the gamer experience.

2. **Real-time personalization** to drive the monetization strategy in the game.

This repository contains a clone of Flappybird. It was built using the Phaser 3 game framework, JavaScript, and [Tinybird](https://www.tinybird.co/), the real-time data platform for data and engineering teams.

## Play the game!

Test your skills by playing [Flappybird](https://flappy-workshop.tinybird.co/)! 🎮🐥 

The goal of the game is to maneuver the bird through a challenging array of pipes, avoiding any collisions. The bird propels itself forward automatically, and you control its flight by either pressing the space bar, enter, or clicking on the screen to flap its wings. If you collide with a pipe, the ground, or the sky, it's game over!

## Create a Tinybird Workspace

To build real-time analytics into the game, you'll need to set up a Tinybird Workspace. Follow these steps:
1. Click [this link](https://ui.us-east.tinybird.co/workspaces/new?name=adc_workshop) to create a Tinybird Workspace.

2. If prompted, log in or create a Tinybird account.

3. Give your Workspace a unique name.

4. Under `Starter kit`, select `None - Empty Workspace`.

5. Click `Create Workspace`.

Your Tinybird Workspace is set up and ready for action!

## Generate Dummy Data

Now that you have a Workspace, you need to ingest a data stream.  
1. In this repo, navigate to `tinybird/datasources` and download the file `events_api.datasource`. This is the schema of your Data Source.

2. Drag and drop the file into the Tinybird UI. Click `Import 1 resource` to import the Data Source.

3. That also created a new token to authorize append requests to the Data Source. In Tinybird, go to `Tokens` in the left navigation pane, select `app_append_token`, and click the `copy` icon to copy the token.

4. To generate dummy data, you will use the open source tool Mockingbird to stream data to Tinybird's [Events API](https://www.tinybird.co/docs/ingest/events-api), an easy-to-use HTTP API that enables high-throughput streaming ingestion. Launch [Mockingbird](https://mockingbird.tinybird.co/?host=us_gcp&datasource=events_api&token=&eps=100&withLimit=on&limit=1000000&generator=Tinybird&endpoint=us_gcp&generatorName=Tinybird&template=Flappybird&schema=Preset), go to `Settings`, paste your token in the `Data Source API Token` input, and click `Save`.

> _Note_: The Mockingbird URL is pre-filled with the region and Data Source name from previous steps. Please take this into account if you wish to make any changes.

6. Scroll down and click `Preview` to see a sample message. Then, scroll further and click `Start Generating!` to stream data to Tinybird.

7. Return to Tinybird, navigate to the `events_api` Data Source, and confirm that data is being ingested.

🎊 In just a few clicks, you set up streaming ingestion into Tinybird!

## Build API Endpoints

Now that a data stream is flowing into Tinybird, the next step is to develop over that data using SQL and publish API Endpoints. You do that in Pipes.

### User-Facing Analytics

For the first use case, you will build a user-facing analytics use case: an API that returns the top 10 scores in a global leaderboard. 🏆

Click the `+` icon next to the Data Project section on the left navigation and select `Pipe`.
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

6. Once you completed the query, click `Create API Endpoint` in the top right corner and select the `aggregate` node.

🎉 BOOM! 🎉 You just went from a data stream to a production-ready API Endpoint in minutes.

Copy the URL from the sample usage section and paste it into a new tab to make an API request. Make a few API requests and watch the leaderboard change! Go back to Tinybird and check out the usage metrics (you may need to wait a second or refresh the page).

> _Note_: This query was split into two nodes to demonstrate the notebook-style UX of Pipes, designed to simplify and accelerate your development. You can decide if you’d like to use one or multiple nodes; the Pipe is still executed as a single query.

#### Optimize with Materialized Views ⚙️

The Pipe you just built queries the raw data from the `events_api` Data Source. The query is performant with a few thousand rows, but as your data scales up to millions or billions of rows, query performance will likely degrade.

A powerful way to optimize queries in Tinybird is through real-time [Materialized Views](https://www.tinybird.co/docs/guides/materialized-views.html). With simple SQL logic, you can pre-aggregate and pre-filter large Data Sources incrementally, producing a more relevant Data Source with significantly fewer rows.

Put simply, Materialized Views shift computational load from query time to ingestion time, so your endpoints stay fast. ⚡️

Follow these steps to optimize your Endpoint with Materialized Views:
1. Create a new Pipe and rename it `mat_player_stats`.

2. Copy and paste this query:
```
SELECT
    name AS player_id,
    session_id,
    count() AS scores,
    max(timestamp) AS end_ts
FROM events_api
WHERE type = 'score'
GROUP BY player_id, session_id
```

3. Run the query and rename the node to `mv`.

4. In the top right, click the green arrow to open the dropdown list, select `Create Materialized View`, and choose the `mv` node.

5. Rename it to `mv_player_stats`. Ensure that the Sorting Key is `player_id,session_id` (in that order). Click `Next`, select `Up to 2M rows`, and `Create Materialized View`. You just created a new Materialized View that aggregates player scores in real-time!

6. Navigate back to the Pipe `mat_player_stats`. You'll notice that Tinybird automatically added the suffix `-State()` to the aggregate functions. This is how Tinybird keeps the Materialized View up-to-date in real-time; Tinybird saves the intermediate state of each aggregation.

7. Navigate to the new Data Source `mv_player_stats`. You'll notice some strange symbols in the `scores` and `end_ts` columns. Don't panic! This is how Tinybird represents the intermediate state.

8. In the top right, click `Create Pipe` and rename the Pipe to `api_leaderboard_mv`.

9. Copy and paste this query:
```
SELECT
    player_id,
    session_id,
    countMerge(scores) AS scores,
    maxMerge(end_ts) AS end_ts
FROM mv_player_stats
GROUP BY player_id, session_id
ORDER BY scores DESC
LIMIT 10
```

10. Run the query and rename the node to `endpoint`. You'll notice that you need to add the suffix `-Merge()` to the aggregate functions. There is an asynchronous process that runs in the background to merge the intermediate states and compact the result. You don't know exactly when that merge will occur, so you need to use `-Merge()` to make sure the process completes at query time.

11. Once you completed the query, click `Create API Endpoint` in the top right corner and select the `endpoint` node.

🎉 Nice work! 🎉 You just created another API Endpoint, but this time you optimized it with a Materialized View.

Copy the URL from the sample usage section and paste it into a new tab to make an API request. Make a few API requests and watch the leaderboard change! The Materialized View stays up to date in real-time.

> _Note_: Materialized Views are often used to improve performance by reducing the size of a Data Source by orders of magnitude. In this workshop, the volume of data may not be great enough to make a significant difference in performance. See a detailed example [here](https://www.tinybird.co/docs/guides/materialized-views.html#creating-a-materialized-view-in-the-tinybird-ui).

## Challenge: Real-Time Personalization

Let's build another use case! This time, you will build a real-time personalization use case: an API that determines whether or not a player receives an offer 💸 based on their performance.

Click the `+` icon next to the Data Project section on the left navigation and select `Pipe`.
1. Rename the pipe to `api_personalization`.

2. Start by querying from the raw `events_api` Data Source.

3. Since you’re already a Tinybird expert 🥇, try writing this query by yourself! The query should work like this:

In the _last hour_, if a player _played 3 or more games_, scored in _fewer than or equal to 15 games_, and made _0 purchases_, **return 1** (player receives an offer because they are struggling). Else, **return 0** (player does not receive an offer).

4. Here are some tips:

- All queries in the UI are free, so explore your data! Create Playgrounds (on the left navigation) to avoid cluttering your Workspace with Pipes.  
- Split your logic into multiple nodes and follow the [5 rules of fast queries](https://www.tinybird.co/docs/guides/best-practices-for-faster-sql.html#the-5-rules-of-fast-queries).  
- Filter on a specific player name to start. Then, make it a dynamic filter with a [query parameter](https://www.tinybird.co/docs/query/query-parameters.html).  
- Use the `uniq()` function to do a distinct count.  
- Use the `countIf()` function to perform a count with a conditional.  
- If you get stuck, you can find inspiration at `tinybird/endpoints/api_personalization.pipe`.

5. For an extra challenge, refactor this query using a Materialized View! If you need help, you can see the solution comprised of three resources: `pipes/mat_player_stats.pipe`, `datasources/mv_player_stats.datasource`, and `endpoints/api_personalization_mv.pipe`.

## Workshop wrap-up

With only a few clicks and a few lines of SQL, you built user-facing analytics to improve the player experience and real-time personalization to drive revenue.

Explore the rest of this repository to see how the entire project fits together. Happy flapping!

---

## Run the Game Locally

To run your own version of the game, you'll need to create a Tinybird Workspace and install Node.js and npm on your computer.

1. [Sign up for Tinybird](https://ui.tinybird.co/signup) and follow the guided process to create an empty Workspace in the provider/region of your choosing.

2. Clone this repository locally

```bash
git clone https://github.com/tinybirdco/flappy-tinybird-workshop.git
cd flappy-tinybird-workshop
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
VITE_EVENT_PARAM=None
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
