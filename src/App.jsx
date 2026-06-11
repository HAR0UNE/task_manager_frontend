import { useEffect, useState } from "react";

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const token = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODEyNzM0MTB9.KA-PMV21CN6gazIQx4TrOZLLYHSdD3vfb6YN8ExdFvA";

  useEffect(() => {
    async function getProjects() {
      try {
        const response = await fetch(
          "http://localhost:3000/api/v1/projects",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        setProjects(data.data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }

    getProjects();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Projects</h1>

      {selectedProject && (
        <div
          style={{
            border: "2px solid green",
            padding: "10px",
            marginBottom: "20px",
          }}
        >
          <h2>Selected Project</h2>
          <p>
            <strong>Name:</strong>{" "}
            {selectedProject.attributes.name || "Unnamed Project"}
          </p>
          <p>
            <strong>ID:</strong> {selectedProject.id}
          </p>
        </div>
      )}

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            <h3>{project.attributes.name || "Unnamed Project"}</h3>

            <p>
              <strong>Project ID:</strong> {project.id}
            </p>

            <p>
              <strong>Tasks:</strong>{" "}
              {project.relationships?.tasks?.data?.length || 0}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;