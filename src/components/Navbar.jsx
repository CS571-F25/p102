import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";

export default function AppNavbar() {
  return (
    <Navbar expand="lg" className="custom-navbar mb-3">
      <Container>
        <Navbar.Brand href="#/" className="navbar-brand-title">
          <i className="bi bi-bucket"></i> Social Bucket List
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto navbar-links">
            <Nav.Link href="#/">Home</Nav.Link>
            <Nav.Link href="#/Groups">Groups</Nav.Link>
            <Nav.Link href="#/MyRSVPs">My RSVPs</Nav.Link>
            <Nav.Link href="#/Memories">Memories</Nav.Link>  {/* <-- NEW */}
            <Nav.Link href="#/AddEvent">Add Event</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
