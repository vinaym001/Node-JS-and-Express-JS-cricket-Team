const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server is running on http://localhost/")
    );
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dBObject) => {
  return {
    movieId: dBObject.movie_id,
    directorId: dBObject.director_id,
    movieName: dBObject.movie_name,
    leadActor: dBObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT movie_name FROM movie;`;
  const movies = await db.all(getAllMoviesQuery);
  response.send(convertDbObjectToResponseObject(movies));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
    movie (director_id, movie_name, lead_actor)
  VALUES
    ('${directorId}', '${movieName}', '${leadActor}');`;
  const player = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movieDetails = await db.get(getMovieQuery);
  response.send(movieDetails);
  console.log(movieDetails);
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
  UPDATE
   movie 
  SET
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE
    FROM
    movie
    WHERE
    movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
