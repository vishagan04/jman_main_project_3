import React, { useEffect, useState } from "react";
import Navbar from "../UI-components/Navbar";
import Sidebar from "../UI-components/Sidebar";
import { Modal, Button, Table } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SkillApproval = () => {
    const [assessments, setAssessments] = useState([]);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [currentAssessmentId, setCurrentAssessmentId] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState("");
    const [skillsOptions, setSkillsOptions] = useState([]);
    const [certificationOptions, setCertificationOptions] = useState([]);

    // Fetch skill assessments for approval and skills/certifications
    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                // Fetch assessments
                const response = await fetch("http://localhost:5000/api/employeeSkillAssessment");
                const data = await response.json();
                console.log("Fetched assessments:", data);
                setAssessments(Array.isArray(data) ? data : []);
                
                // Fetch skills
                const skillResponse = await fetch("http://localhost:5000/api/skills");
                const skills = await skillResponse.json();
                setSkillsOptions(skills);

                // Fetch certifications
                const certResponse = await fetch("http://localhost:5000/api/courses");
                const certifications = await certResponse.json();
                setCertificationOptions(certifications);
            } catch (error) {
                console.error("Error fetching assessments or options:", error);
            }
        };

        fetchAssessments();
    }, []);

    const handleApprovalClick = (assessmentId) => {
        setCurrentAssessmentId(assessmentId);
        setShowApprovalModal(true);
    };

    const handleApprovalStatusChange = (status) => {
        setApprovalStatus(status);
    };

    const handleSubmitApproval = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/skill-approval/${currentAssessmentId}/approval`, 
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ approvalStatus }),
                }
            );

            if (response.ok) {
                const updatedAssessment = await response.json();
                setAssessments((prev) =>
                    prev.map((assessment) =>
                        assessment._id === currentAssessmentId ? updatedAssessment : assessment
                    )
                );
                toast.success(`Assessment ${approvalStatus.toLowerCase()} successfully!`);
                handleCloseModal();
            } else {
                console.error("Error updating approval status:", response.statusText);
                toast.error("Failed to update approval status!");
            }
        } catch (error) {
            console.error("Error updating approval status:", error);
            toast.error("Error updating approval status!");
        }
    };

    const handleCloseModal = () => {
        setShowApprovalModal(false);
        setCurrentAssessmentId(null);
        setApprovalStatus("");
    };

    const getCertificationName = (id) => {
        const certification = certificationOptions.find((cert) => cert._id === id);
        return certification ? certification.name : "Unknown Certification";
    };

    const getSkillName = (id) => {
        const skill = skillsOptions.find((skill) => skill._id === id);
        return skill ? skill.name : "Unknown Skill";
    };

    return (
        <div className="employee-dashboard vh-100">
            <Navbar />
            <div className="row m-0 w-100 min-vh-100 z-0">
                <Sidebar />
                <div className="dashboard-content container mt-4 col-9 col-lg-10 z-0">
                    <ToastContainer />
                    <h1 className="mb-4">Skill Approval Management</h1>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Assessment ID</th>
                                <th>Employee Name</th>
                                <th>Skill</th>
                                <th>Certification</th>
                                <th>Score</th>
                                <th>Approval Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assessments.length > 0 ? (
                                assessments.map((assessment) => (
                                    <tr key={assessment._id}>
                                        <td>{assessment._id}</td>
                                        <td>{assessment.employeeId?.name || "Unknown Employee"}</td>
                                        <td>{getSkillName(assessment.skills) || "Unknown Skill"}</td>
                                        <td>{getCertificationName(assessment.certification) || "No Certification"}</td>
                                        <td>{assessment.marks}</td>
                                        <td>{assessment.approvalStatus || "Pending"}</td>
                                        <td>
                                            <Button
                                                variant="success" // Bootstrap success color for Approve
                                                className="me-2"
                                                onClick={() => {
                                                    handleApprovalClick(assessment._id);
                                                    handleApprovalStatusChange("Approved");
                                                }}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="danger" // Bootstrap danger color for Reject
                                                onClick={() => {
                                                    handleApprovalClick(assessment._id);
                                                    handleApprovalStatusChange("Rejected");
                                                }}
                                            >
                                                Reject
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        No assessments available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {/* Modal for Approval */}
                    <Modal show={showApprovalModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Approval Confirmation</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <h5>Set Approval Status: {approvalStatus}</h5>
                            <p>Are you sure you want to {approvalStatus.toLowerCase()} this assessment?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleSubmitApproval}>
                                Submit
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default SkillApproval;
