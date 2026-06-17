import { useEffect, useState } from "react";

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const token =
    "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2LCJleHAiOjE3ODE3NzY5NjR9.p0Tp6dFKCDQCXde58SHBrvV4fgkoYrBEMd4LOlLTevA";

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
        console.error(error);
      }
    }

    getProjects();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        gap: "30px",
        padding: "30px",
        alignItems: "flex-start",
      }}
    >
      {/* LEFT COLUMN */}
      <div style={{ width: "40%" }}>
        <h1>Projects</h1>

        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              style={{
                border:
                  selectedProject?.id === project.id
                    ? "2px solid green"
                    : "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <h3>{project.attributes.name}</h3>

              <p>
                <strong>ID:</strong> {project.id}
              </p>

              <p>
                <strong>Tasks:</strong>{" "}
                {project.relationships?.tasks?.data?.length || 0}
              </p>
            </div>
          ))
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div
        style={{
          flex: 1,
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          minHeight: "500px",
        }}
      >
        {!selectedProject ? (
          <h2>Select a project</h2>
        ) : (
          <>
            <h2>{selectedProject.attributes.name}</h2>

            <p>
              <strong>Project ID:</strong> {selectedProject.id}
            </p>

            <p>
              <strong>Tasks:</strong>{" "}
              {selectedProject.relationships?.tasks?.data?.length || 0}
            </p>

            <hr />

            <h3>Tasks</h3>

            <p>
              This panel will display all tasks belonging to the selected
              project.
            </p>

            {/* Next step:
                Fetch tasks for this project
                and display them here.
            */}
          </>
        )}
      </div>
    </div>
  );
}

export default App;