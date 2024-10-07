import React, { useEffect, useState } from "react";
import EmployeeNavbar from "./components/EmployeeNavbar";
import EmployeeSidebar from "./components/EmployeeSidebar";
import { Button, Modal, Table } from "react-bootstrap";
import SkillAssessmentForm from "./components/SkillAssessmentForm";

const SkillAssessment = () => {
  const [assessments, setAssessments] = useState([]);
  const [certificationOptions, setCertificationOptions] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const employeeId = JSON.parse(localStorage.getItem("employee")).id;

  // Fetch assessments and options on load
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/employeeSkillAssessment/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch assessments");
        }

        const data = await response.json();
        setAssessments(data);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };

    const fetchOptions = async () => {
      try {
        const certResponse = await fetch("http://localhost:5000/api/courses");
        const certData = await certResponse.json();
        setCertificationOptions(certData);

        const skillResponse = await fetch("http://localhost:5000/api/skills");
        const skillData = await skillResponse.json();
        setSkillOptions(skillData);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchAssessments();
    fetchOptions();
  }, [employeeId]);

  // Handle deleting an assessment
  const handleDeleteAssessment = async (assessmentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/employeeSkillAssessment/${assessmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete assessment");
      }

      setAssessments((prev) =>
        prev.filter((assessment) => assessment._id !== assessmentId)
      );
    } catch (error) {
      console.error("Error deleting assessment:", error);
    }
  };

  // Get the certification name from the certification ID
  const getCertificationName = (id) => {
    const certification = certificationOptions.find((cert) => cert._id === id);
    return certification ? certification.name : "Unknown Certification";
  };

  // Get the skill name from the skill ID
  const getSkillName = (id) => {
    const skill = skillOptions.find((skill) => skill._id === id);
    return skill ? skill.name : "Unknown Skill";
  };

  return (
    <div className="employee-dashboard vh-100">
      <EmployeeNavbar />
      <div
        className="row m-0 w-100 min-vh-100 z-0"
        style={{
          paddingTop: "95px",
        }}
      >
        <EmployeeSidebar />
        <div
          className="dashboard-content container mt-4 col-9 col-lg-10 z-0"
          style={{
            zIndex: 0,
          }}
        >
          <h1 className="mb-4">Skill Assessment</h1>
          <Button
            variant="success"
            className="mb-4"
            onClick={() => setShowAddModal(true)}
          >
            Add New Assessment
          </Button>

          {/* Assessment Table */}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Course</th>
                <th>Skill</th>
                <th>Score</th>
                <th>Approval Status</th> {/* New column for approval status */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => (
                <tr key={assessment._id}>
                  <td>{getCertificationName(assessment.certification)}</td>
                  <td>{getSkillName(assessment.skills)}</td>
                  <td>{assessment.marks}</td>
                  <td>{assessment.approvalStatus || "Pending"}</td>{" "}
                  {/* Display "Pending" if approvalStatus is not defined */}
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteAssessment(assessment._id)}
                      className="ml-2"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Modal for adding a new assessment */}
          <Modal
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Add New Assessment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <SkillAssessmentForm
                assessmentId={null}
                employeeId={employeeId}
                onSubmit={(newAssessment) => {
                  newAssessment.approvalStatus = "Pending"; // Set initial status as "Pending"
                  setAssessments((prev) => [...prev, newAssessment]);
                  setShowAddModal(false);
                }}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default SkillAssessment;
