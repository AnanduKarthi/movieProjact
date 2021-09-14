const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
let db = null;
app.use(express.json());

const initializingDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`db Error ${e.message}`);
    process.exit(1);
  }
};

initializingDbServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
    movieId: dbObject.movie_id,
  };
};

const directorConversion = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// GET Movies API 1
app.get("/movies/", async (request, response) => {
  const getMovieNameQuery = `
    SELECT movie_name
    FROM movie;
    `;
  const movieNameArray = await db.all(getMovieNameQuery);
  response.send(
    movieNameArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//Post Movies API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
    movie ( director_id, movie_name, lead_actor)
  VALUES
    (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

// GET Movie API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movieArray = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movieArray));
});

// PUT Movie API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateQuery = `
            UPDATE
              movie
            SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
            WHERE
              movie_id = ${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

// DELETE Movie API 4
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

// GET Directors API 5
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT *
    FROM director;`;
  const directorArray = await db.all(getDirectorQuery);
  response.send(directorArray.map((each) => directorConversion(each)));
});

//GET specific Movie API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const specificMovieQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const specificArray = await db.all(specificMovieQuery);
  response.send(
    specificArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
