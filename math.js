document.addEventListener("DOMContentLoaded", () => {
  const planetsData = [
    { name: "Mercury", image: "mercury.png", position: { left: 300, top: 100 } },
    { name: "Venus", image: "venus.png", position: { left: 500, top: 200 } }
    // Add data for other planets similarly
  ];

  const solarSystem = document.getElementById("solar-system");

  planetsData.forEach(planetData => {
    const planet = document.createElement("img");
    planet.setAttribute("class", "planet");
    planet.src = planetData.image;
    planet.style.left = `${planetData.position.left}px`;
    planet.style.top = `${planetData.position.top}px`;
    solarSystem.appendChild(planet);
  });
});
