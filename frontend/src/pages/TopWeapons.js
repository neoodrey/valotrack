import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function TopWeapons() {
  const [topWeapons, setTopWeapons] = useState([]);
  const [allWeapons, setAllWeapons] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopWeapons() {
      try {
        const weaponsRes = await axios.get("https://valorant-api.com/v1/weapons");
        const weaponsMap = weaponsRes.data.data.reduce((map, weapon) => {
          map[weapon.uuid] = weapon;
          return map;
        }, {});
        setAllWeapons(weaponsMap);

        const topRes = await axios.get("http://127.0.0.1:8000/api/favorites/top/weapons/");
        setTopWeapons(topRes.data);
      } catch (err) {
        console.error("Failed to load top weapons", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopWeapons();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="val-container">
        <h1>Loading Top Weapons...</h1>
      </div>
    );
  }

  return (
    <div className="val-container">
      <header className="val-header" style={{borderBottomColor: '#06d6a0'}}>
        <h1 style={{color: '#06d6a0'}}>Global Top Weapons</h1>
        <div className="val-header-nav">
          <button onClick={handleLogout} className="val-button">
            Logout
          </button>
          <Link to="/home" className="val-button">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="val-grid">
        {topWeapons.length > 0 ? (
          topWeapons.map((weapon, index) => {
            const weaponData = allWeapons[weapon.weapon_uuid];
            return weaponData ? (
              <div key={weapon.weapon_uuid} className="val-card val-card-green">
                <Link to={`/weapon/${weapon.weapon_uuid}`} state={{ from: '/top-weapons' }} style={{textDecoration: 'none', width: '100%'}}>
                  <div style={{
                      position: 'absolute', 
                      top: '10px', 
                      left: '10px', 
                      background: '#06d6a0', 
                      color: 'black', 
                      width: '30px', 
                      height: '30px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontFamily: 'Bebas Neue'
                  }}>
                      {index + 1}
                  </div>
                  <div className="val-card-image-container" style={{height: '80px'}}>
                    <img
                      src={weaponData.displayIcon}
                      alt={weaponData.displayName}
                      className="val-card-weapon-image"
                    />
                  </div>
                  <h3>{weaponData.displayName}</h3>
                </Link>
                
                <div style={{marginTop: '10px', borderTop: '1px solid #555', paddingTop: '10px', width: '100%'}}>
                    <p className="val-card-leaderboard-count-green">{weapon.percentage}%</p>
                    <p style={{color: '#aaa', fontSize: '12px', marginTop: '-5px'}}>Favorited by users</p>
                </div>
              </div>
            ) : null;
          })
        ) : (
          <p>No weapons have been favorited yet!</p>
        )}
      </div>
    </div>
  );
}