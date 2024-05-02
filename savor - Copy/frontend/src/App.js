import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min';
import $ from 'jquery';

import { useState, useEffect } from 'react';

function App() {
  // State for if there is a user signed in
  const [signedIn, setSignedIn] = useState(false);

  // State which holds the username of the profile you're currently viewing
  const [profileUser, setProfileUser] = useState();
  
  // State which holds the data of the user's account
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    totalLikes: 0,
    userRecipes: [],
    likedRecipes: []
  })
  
  // State which holds the data of the user's profile you're currently viewing
  const [profileData, setProfileData] = useState({
    username: "",
    totalLikes: 0,
    userRecipes: [],
    likedRecipes: []
  })

  // Needs more Bootstrap elements
  const Navbar = () => {
    const navigate = useNavigate();
    
    const viewProfile = () => {
      setProfileUser(userData.username);
      navigate(`/profile/`);
    }

    return (
        <nav class="navbar navbar-expand-md navbar-fixed-top navbar-custom">
              <a class="navbar-brand navbar-content" onClick={() => navigate('/')}>Savor</a>
              <ul class="navbar-nav">
                  <li class="nav-item">
                      <a class="nav-link" href="#">Find Recipes</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" href="#">Upload Recipes</a>
                  </li>
              </ul>
              <div class="navbar-nav align-right">
                  <li class="nav-item dropdown">
                      <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          Profile
                      </button>
                      <ul class="dropdown-menu">
                        {signedIn == false && 
                            <div>
                                <li><a class="dropdown-item" onClick={() => navigate('/signIn')}>Sign In</a></li>
                                <li><a class="dropdown-item" onClick={() => navigate('/createAccount')}>Register</a></li>
                            </div>  
                        }

                        {signedIn == true && 
                            <div>
                                <li><a class="dropdown-item" onClick={viewProfile}>View Profile</a></li>
                                <li><a class="dropdown-item" onClick={() => navigate('/signOut')}>Sign Out</a></li>
                            </div>  
                        }
                      </ul>
                  </li>
              </div>
        </nav>
    )
  }

  // Work-in-progress
  const Home = () => {
    return(
      <div>
        <Navbar/>
      </div>
    )
  }

  // Needs more Bootstrap elements
  const CreateAccount = () => {
    const navigate = useNavigate();

    // State which holds the data of the account being created
    const [accountData, setAccountData] = useState({
      username: "",
      email: "",
      password: "",
      totalLikes: 0,
      userRecipes: [],
      likedRecipes: []
    })
    
    // Errors checked for when creating an account
    const [errors, setErrors] = useState({
      validUsernameLength: true,
      unusedUsername: true,
      validEmail: true,
      unusedEmail: true,
      validPassword: true,
    });

    // Fetches accounts to see if there already exists an account with the same username and/or email
    const [fecthedUserbyUsername, setUserbyUsername] = useState([])
    const [fecthedUserbyEmail, setUserbyEmail] = useState([])

    useEffect(() => {    
      if (accountData.username) {
        fetch(`http://localhost:8081/savor/user/username/${accountData.username}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(`Fetching data from user ${accountData.username}:`, data);
            setUserbyUsername(data)
            });
          }

      if (accountData.email) {
        fetch(`http://localhost:8081/savor/user/email/${accountData.email}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(`Fetching data from user ${accountData.email}:`, data);
            setUserbyEmail(data)
          });
        }    
    }, [accountData.username, accountData.email]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setAccountData(prevState => ({
      ...prevState,
      [name]: value
      }));
    };

    // Validates if there are no errors in the form
    const formValidation = () => {
      let formValidUsernameLength = false;
      let formUnusedUsername = false;
      let formValidEmail = false;
      let formUnusedEmail = false;
      let formValidPassword = false;
      let pattern = /^\S+@\S+$/i;
      
      if (accountData.username.length < 4) {
        formValidUsernameLength = false;
      } else {
        formValidUsernameLength = true;
      }

      if (fecthedUserbyUsername.length > 0) {
        formUnusedUsername = false;
      } else {
        formUnusedUsername = true;
      }

      if (accountData.email.search(pattern) == -1) {
        formValidEmail = false;
      } else {
        formValidEmail = true
      }

      if (fecthedUserbyEmail.length > 0) {
        formUnusedEmail = false;
      } else {
        formUnusedEmail = true;
      }

      if (accountData.password.length < 8) {
        formValidPassword = false;
      } else {
        formValidPassword = true;
      }

      setErrors(prevState => ({
        ...prevState,
        ["validUsernameLength"]: formValidUsernameLength,
        ["unusedUsername"]: formUnusedUsername,
        ["validEmail"]: formValidEmail,
        ["unusedEmail"]: formUnusedEmail,
        ["validPassword"]: formValidPassword
      }));

      if (formValidUsernameLength && formUnusedUsername && formValidEmail && formUnusedEmail && formValidPassword) {
        return true;
      } else {
        return false;
      }
    }

    const handleSubmit = (e) => {
      e.preventDefault();
      if(formValidation()) {
        console.log(e.target.value);
        fetch("http://localhost:8081/createAccount", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(accountData)
        })
        .then(response => {
            if (response.status != 200){
                return response.json()
        .then(errData =>{
            throw new Error(`POST response was not ok :\n Status:${response.status}. \n Error: ${errData.error}`);
        })
        }
        return response.json();})
        .then(data => {
            console.log(data);
            alert("Account created successfully!");
            navigate("/");
        })
        .catch(error => {
            console.error('Error creating account:', error);
            alert('Error creating account:'+error.message); // Display alert if there's an error
        });
      }
    }

    return(
      <div>
        <Navbar/>
        <div class="container-fluid">
          <form class="form-group" onSubmit={handleSubmit}>
            <h1>Create an Account</h1>
              <input type="text" name="username" value={accountData.username} onChange={handleChange} placeholder="Username" required /> <br />
              {!errors.validUsernameLength && <p class="text-danger">Username must be at least 4 characters long.</p>}
              {!errors.unusedUsername && <p class="text-danger">Username is already taken.</p>}
              <input type="text" name="email" value={accountData.email} onChange={handleChange} placeholder="Email" required /> <br />
              {!errors.validEmail && <p class="text-danger">Invalid email.</p>}
              {!errors.unusedEmail && <p class="text-danger">There's an account already associated with this email.</p>}
              <input type="text" name="password" value={accountData.password} onChange={handleChange} placeholder="Password" required /> <br />
              {!errors.validPassword && <p class="text-danger">Password must be at least 8 characters long.</p>}
              <button class="btn btn-success" type='submit'>Register</button>
          </form>
        </div>
      </div>  
    )
  }

  // Needs more Bootstrap elements
  const SignIn = () => {
    const navigate = useNavigate();

    // State which stores sign in information
    const [formData, setFormData] = useState({
      username: "",
      password: ""
    })
    
    // State which stores the account fetched based on the form data
    const [accountData, setAccountData] = useState({
      username: "",
      email: "",
      password: "",
      totalLikes: 0,
      userRecipes: [],
      likedRecipes: []
    })
    
    // Errors checked for when signing in
    const [errors, setErrors] = useState({
      passwordMatch: true
    }) 

    useEffect(() => {    
      if (formData.username) {
        fetch(`http://localhost:8081/savor/user/username/${formData.username}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(`Fetching data from user ${formData.username}:`, data);
            setAccountData(data[0])
          });
      }
    }, [formData.username]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prevState => ({
      ...prevState,
      [name]: value
      }));
    };

    // Validates if there are no errors in the form
    const formValidation = () => {
      let formPasswordMatch = false;

      if (accountData.password == formData.password) {
        formPasswordMatch = true;
      } else {
        formPasswordMatch = false;
      }
      console.log(accountData);
      console.log(formData.password);
      console.log(formPasswordMatch);

      setErrors(prevState => ({
        ...prevState,
        ["passwordMatch"]: formPasswordMatch,
      }))

      if(formPasswordMatch) {
        return true;
      } else {
        return false;
      }
    }

    const handleSubmit = (e) => {
      e.preventDefault();
      if(formValidation()) { 
        setUserData(accountData);
        console.log(`Signed in as user ${accountData.username}`);
        setSignedIn(true);
        navigate('/');
      }
    }

    return (
      <div>
        <Navbar/>
        <div class="container-fluid">
          <form class="form-group" onSubmit={handleSubmit}>
            <h1>Sign In</h1>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required /> <br />
              <input type="text" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required /> <br />
              {!errors.passwordMatch && <p class="text-danger">Incorrect username or password.</p>}
              <button class="btn btn-success" type='submit'>Sign In</button>
          </form>
        </div>  
      </div>

    )
  }

  // Work-in-progress
  const SignOut = () => {
    const navigate = useNavigate();
    if (signedIn == true) {
    setSignedIn(false);
    console.log(`Signing out as ${userData.username}`)
    setUserData({
      username: "",
      email: "",
      password: "",
      totalLikes: 0,
      userRecipes: [],
      likedRecipes: []
    })
    navigate("/");
    }
  }

  // Work-in-progress
  const Profile = () => {
    const [currentRecipeID, setCurrentRecipeID] = useState("");
    const [currentRecipeData, setCurrentRecipeData] = useState({});

    useEffect(() => {    
      if (profileUser) {
        fetch(`http://localhost:8081/savor/user/username/${profileUser}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(`Fetching data from user ${profileUser}:`, data);
            setProfileData(prevState => ({
              ...prevState,
              ["username"]: data[0].username,
              ["totalLikes"]: data[0].totalLikes,
              ["userRecipes"]: data[0].userRecipes,
              ["likedRecipes"]: data[0].likedRecipes
            }));
          });
      }
    }, [profileUser]);

    useEffect(() => {    
      if (currentRecipeID) {
        fetch(`http://localhost:8081/savor/recipe/id/${currentRecipeID}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(`Fetching data from user ${profileUser}:`, data);
            setProfileData(prevState => ({
              ...prevState,
              ["username"]: data[0].username,
              ["totalLikes"]: data[0].totalLikes,
              ["userRecipes"]: data[0].userRecipes,
              ["likedRecipes"]: data[0].likedRecipes
            }));
          });
      }
    }, [currentRecipeID]);

    const loadRecipestoProfile = () => {
      for (var recipe = 0; recipe < profileData.userRecipes.length; recipe++) {
        setCurrentRecipeID(recipe)
      }
    }

    return (
      <div>
        <Navbar/>
        <div class="container-fluid">
          <h1>{profileData.username}</h1>
          <p>{profileData.totalLikes} likes</p>
          <h2>Recipes</h2>
          <div>
            {loadRecipestoProfile()}
          </div>
        </div>
      </div>
    )
  }

  // Work-in-progress
  const UploadRecipe = () => {
    return(
      <div>
        <Navbar/>

      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={Home()}/>
      <Route path="/createAccount" element={CreateAccount()}/>
      <Route path="/signIn" element={SignIn()}/>
      {/* <Route path="/signOut" element={SignOut()}/> */}
      <Route path="/profile" element={Profile()}/>
      <Route path="/uploadRecipe" element={UploadRecipe()}/>
    </Routes>
  );
}

export default App;
