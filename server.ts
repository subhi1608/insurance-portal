import app from "./app";

const PORT = Number(process.env.PORT) || 8000;

app.listen(PORT, () => {
  console.log(`Server running at PORT ${PORT}`);
});
