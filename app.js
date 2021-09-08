const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("server running at http://localhost:3002");
    });
  } catch (e) {
    console.log(`DB ERROR : ${e.message}`);
    process.exit(1);
  }
};
initializeDBServer();
//to response obj function
const convertToResponseObject = (movie) => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
};
const passToResponseObject = (director) => {
  return {
    directorId: director.director_id,
    directorName: director.director_name,
  };
};

// GET API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`;
  const movieArray = await db.all(getMoviesQuery);
  response.send(
    movieArray.map((eachMovie) => convertToResponseObject(eachMovie))
  );
});

// POST API
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `INSERT INTO movie(movie_name,director_id,lead_actor) VALUES ('${movieName}','${directorId}','${leadActor}');`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//GET specific movie API
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const getMoviesQuery = `SELECT * FROM movie WHERE movie_id='${movieId}';`;
  const movieDetails = await db.get(getMoviesQuery);
  console.log(movieDetails);
  response.send(convertToResponseObject(movieDetails));
});

//PUT API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const putMovieQuery = `UPDATE movie set director_id='${directorId}', movie_name='${movieName}', lead_actor='${leadActor}' WHERE  movie_id=${movieId};`;
  await db.run(putMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE API
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// GET all directors API
app.get("/directors/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM director;`;
  const movieArray = await db.all(getMoviesQuery);
  response.send(movieArray.map((eachMovie) => passToResponseObject(eachMovie)));
});

//specific director-movie API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  console.log(directorId);
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id=${directorId};`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  console.log(moviesArray);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
