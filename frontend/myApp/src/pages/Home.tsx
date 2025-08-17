import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLoading,
  IonAlert,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
  IonBackButton
} from "@ionic/react";
import { useHistory } from "react-router-dom";

interface User {
  id: number;
  email: string;
  name: string;
  phone_num: string;
  created_at: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const history = useHistory();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        history.push("/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setEditEmail(data.email);
        } else {
          setAlertMsg("Failed to fetch profile. Please log in again.");
          setShowAlert(true);
        }
      } catch (error) {
        setAlertMsg("Server error while fetching profile.");
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [history]);

  const handleUpdate = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/users/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: editEmail,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAlertMsg("Profile updated successfully!");
        setUser({ ...user!, email: editEmail });
        setShowModal(false);
        setEditPassword("");
      } else {
        setAlertMsg(data.error || "Update failed.");
      }
      setShowAlert(true);
    } catch (error) {
      setAlertMsg("Error updating account.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/users/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAlertMsg("Account deleted successfully.");
        setShowAlert(true);
        localStorage.removeItem("access_token");
        setTimeout(() => history.push("/login"), 1500);
      } else {
        const data = await response.json();
        setAlertMsg(data.error || "Delete failed.");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMsg("Error deleting account.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    history.push("/login");
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message="Loading..." />
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Profile"
          message={alertMsg}
          buttons={["OK"]}
        />
        <IonAlert
          isOpen={showConfirmDelete}
          onDidDismiss={() => setShowConfirmDelete(false)}
          header="Delete Account"
          message="Are you sure you want to delete your account? This cannot be undone."
          buttons={[
            { text: "Cancel", role: "cancel" },
            { text: "Delete", handler: () => handleDelete() },
          ]}
        />

        {user && (
          <IonCard style={{ borderRadius: "15px" }}>
            <IonCardHeader>
              <IonCardTitle>{user.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone_num}</p>
              <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleString()}</p>

              <IonGrid>
                <IonRow className="ion-justify-content-center" style={{ gap: "10px" }}>
                  <IonCol size="auto">
                    <IonButton style={{ width: "200px" }} onClick={() => setShowModal(true)}>
                      Update Profile
                    </IonButton>
                  </IonCol>
                  <IonCol size="auto">
                    <IonButton style={{ width: "200px" }} color="danger" onClick={() => setShowConfirmDelete(true)}>
                      Delete Account
                    </IonButton>
                  </IonCol>
                  <IonCol size="auto">
                    <IonButton style={{ width: "200px" }} color="medium" onClick={handleLogout}>
                      Logout
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>

            </IonCardContent>
          </IonCard>
        )}

        {/* Modal for Update */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar color="secondary">
              <IonTitle>Update Profile</IonTitle>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="floating">Email</IonLabel>
              <IonInput
                style ={{ marginTop: "10px"}}
                value={editEmail}
                onIonChange={(e) => setEditEmail(e.detail.value!)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">New Password</IonLabel>
              <IonInput
                style ={{ marginTop: "10px"}}
                value={editPassword}
                type="password"
                onIonChange={(e) => setEditPassword(e.detail.value!)}
              />
            </IonItem>

            <IonButton  className="ion-margin-top" onClick={handleUpdate}>
              Save Changes
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
