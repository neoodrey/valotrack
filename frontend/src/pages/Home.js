import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AGENT_ROLES = ["All", "Duelist", "Initiator", "Controller", "Sentinel"];

export default function Home() {
  const [allAgents, setAllAgents] = useState([]); 
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("https://valorant-api.com/v1/agents?isPlayableCharacter=true")
      .then((res) => {
        setAllAgents(res.data.data);
        setFilteredAgents(res.data.data); 
      });

    axios
      .get("http://127.0.0.1:8000/api/favorites/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFavorites(res.data));
  }, [token]);

  useEffect(() => {
    let tempAgents = [...allAgents];
    if (selectedRole !== "All") {
      tempAgents = tempAgents.filter(
        (agent) => agent.role.displayName === selectedRole
      );
    }
    if (searchTerm) {
      tempAgents = tempAgents.filter((agent) =>
        agent.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAgents(tempAgents);
  }, [searchTerm, selectedRole, allAgents]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const toggleFavorite = async (agent) => {
    const exists = favorites.find((f) => f.agent_uuid === agent.uuid);
    if (exists) {
      await axios.delete(
        `http://127.0.0.1:8000/api/favorites/${exists.id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites(favorites.filter((f) => f.agent_uuid !== agent.uuid));
    } else {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/favorites/",
        { agent_uuid: agent.uuid, agent_name: agent.displayName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites([...favorites, res.data]);
    }
  };

  return (
    <div className="val-container">
      <header className="val-header">
        <h1>Valorant Tracker</h1>
        <div className="val-header-nav">
            <button onClick={handleLogout} className="val-button" style={{borderColor: '#fff', color: '#fff'}}>
            Logout
            </button>
        </div>
      </header>

      <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '40px'}}>
          <Link to="/top-agents" className="val-button" style={{fontSize: '18px', padding: '15px 30px'}}>
             👑 Top Agents
          </Link>
          <Link to="/top-weapons" className="val-button val-button-green" style={{fontSize: '18px', padding: '15px 30px'}}>
             🔫 Top Weapons
          </Link>
          <Link to="/weapons" className="val-button val-button-green">
             View All Weapons
          </Link>
          <Link to="/favorites" className="val-button">
             My Fave Agents
          </Link>
          <Link to="/favorite-weapons" className="val-button val-button-green">
             My Fave Weapons
          </Link>
      </div>
      
      <div className="val-filter-container">
        <h2 style={{color: '#ff4655'}}>Agents Database</h2>
        <input
          type="text"
          placeholder="Search agents..."
          className="val-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="val-role-filter-container">
          {AGENT_ROLES.map(role => (
            <button
              key={role}
              className={`val-role-button ${selectedRole === role ? 'active' : ''}`}
              onClick={() => setSelectedRole(role)}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="val-grid">
        {filteredAgents.length > 0 ? (
          filteredAgents.map((agent) => {
            const isFav = favorites.some((f) => f.agent_uuid === agent.uuid);
            return (
              <div key={agent.uuid} className="val-card">
                <Link to={`/agent/${agent.uuid}`} state={{ from: 'home' }} style={{textDecoration: 'none', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                  <div className="val-card-image-container">
                    <img
                      src={agent.displayIcon}
                      alt={agent.displayName}
                      className="val-card-image"
                    />
                  </div>
                  <h3>{agent.displayName}</h3>
                </Link>

                <button
                  onClick={() => toggleFavorite(agent)}
                  className={`val-button-fav ${isFav ? "remove" : "add"}`}
                  style={{marginTop: '10px'}}
                >
                  {isFav ? "Unfavorite" : "Favorite"}
                </button>
              </div>
            );
          })
        ) : (
          <p>No agents match your criteria.</p>
        )}
      </div>
    </div>
  );
}