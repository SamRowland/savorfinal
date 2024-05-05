import './App.css';
import { BrowserRouter as Router, Route, Routes, useFetcher } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min';
import $ from 'jquery';

import { useState, useEffect, createElement } from 'react';

function App() {
  let navigate = useNavigate();

  const UpdateUserData = () => {   
      if (signedIn) {
        fetch(`http://localhost:8081/user/username/${userData.username}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(`Fetching data from user ${userData.username}:`, data);
            setUserData(data[0])
          });
      }
  }

  const toProfile = (user) => {
    UpdateUserData();
    setProfileUser(user);
    navigate(`/profile`);

  }

  const toSignIn = () => {
    navigate("/signIn");
  }

  const toUploadRecipe = () => {
    UpdateUserData();
    navigate("/uploadRecipe");
  }

  const toRecipe = (recipeId) => {
    UpdateUserData();
    setViewingRecipeId(recipeId);
    navigate("/recipe");
  }

  // State for if there is a user signed in
  const [signedIn, setSignedIn] = useState(false);

  // State which holds the username of the profile you're currently viewing
  const [profileUser, setProfileUser] = useState();

  const [viewingRecipeId, setViewingRecipeId] = useState("");
  
  // State which holds the data of the user's account
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    totalLikes: 0,
    userRecipes: [],
    likedRecipes: []
  })

  // Needs more Bootstrap elements
  const Navbar = () => {
    const navigate = useNavigate();
    return (
        <nav class="navbar navbar-expand-md navbar-fixed-top navbar-custom">
              <a class="navbar-brand navbar-content" onClick={() => navigate('/')}>Savor</a>
              <ul class="navbar-nav">
                  <li class="nav-item">
                      <a class="nav-link" href="#">Find Recipes</a>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" onClick={(signedIn && toUploadRecipe || (!signedIn && toSignIn))}>Upload Recipes</a>
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
                                <li><a class="dropdown-item" onClick={function(){toProfile(userData.username)}}>View Profile</a></li>
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
        fetch(`http://localhost:8081/user/username/${accountData.username}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(`Fetching data from user ${accountData.username}:`, data);
            setUserbyUsername(data)
            });
          }

      if (accountData.email) {
        fetch(`http://localhost:8081/user/email/${accountData.email}`)
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
      navigate("/");
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
      accountFound: true,
      passwordMatch: true
    }) 

    useEffect(() => {    
      if (formData.username) {
        fetch(`http://localhost:8081/user/username/${formData.username}`)
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
      let formAccountFound = false;
      let formPasswordMatch = false;

      if (accountData != null) {
        formAccountFound = true;
        if (accountData.password == formData.password) {
          formPasswordMatch = true;
        } else {
          formPasswordMatch = false;
        }
        console.log(accountData);
        console.log(formData.password);
        console.log(formPasswordMatch);
    } else {
      formAccountFound = false;
    }
      setErrors(prevState => ({
        ...prevState,
        ["accountFound"]: formAccountFound,
        ["passwordMatch"]: formPasswordMatch,
      }))

      if(formAccountFound && formPasswordMatch) {
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
              {(!errors.accountFound || !errors.passwordMatch) && <p class="text-danger">Incorrect username or password.</p>}
              <button class="btn btn-success" type='submit'>Sign In</button>
          </form>
        </div>  
      </div>

    )
  }

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
    }
    useEffect(() => {
      navigate("/");
    }, []);
  }

  // Work-in-progress
  const Profile = () => {
    let userRecipeList = [];
    let likedRecipesList = [];
    let userRecipeStartIndex = 0;
    let likedRecipeStartIndex = 0;
    
    // State which holds the data of the user's profile you're currently viewing
    const [profileData, setProfileData] = useState({
      username: "",
      totalLikes: 0,
      userRecipes: [],
      likedRecipes: []
    })

    useEffect(() => {    
        fetch(`http://localhost:8081/user/username/${profileUser}`)
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
    }, [profileUser]);

    useEffect(() => { 
      let userRecipe = 0   
      for (var id = 0; id < profileData.userRecipes.length; id++) {
        let currentRecipeID = profileData.userRecipes[id];
        fetch(`http://localhost:8081/recipe/id/${currentRecipeID}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(`Fetching recipe by ID ${currentRecipeID}:`, data);
            userRecipeList[userRecipe] = data;
            userRecipe++;
            console.log(userRecipeList)
          })
          .then(() => loadUserRecipes());
          };
      let likedRecipe = 0;
      for (var id = 0; id < profileData.likedRecipes.length; id++) {
        let currentRecipeID = profileData.likedRecipes[id];
        fetch(`http://localhost:8081/recipe/id/${currentRecipeID}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(`Fetching recipe by ID ${currentRecipeID}:`, data);
            likedRecipesList[likedRecipe] = data;
            likedRecipe++;
            console.log(likedRecipesList)
          })
          .then(() => loadLikedRecipes());
      };
    }, [profileData]);

    const loadUserRecipes = () => {      
      let recipeContainer = document.getElementById("userRecipesContainer");
      recipeContainer.replaceChildren();
      for (let index = userRecipeStartIndex; index < Math.min(userRecipeList.length, userRecipeStartIndex + 5); index++) {
        let curRecipe = userRecipeList[index];
        let recipeCard = document.createElement("div");
        recipeCard.classList.add("card");
        recipeCard.innerHTML = 
        `<div class="row g-0" >
        <div class="col-sm-2">
          <img src=${curRecipe.image} class="img-fluid rounded-start profile-recipe-img" alt=${curRecipe.name}>
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title"}>${curRecipe.name}</h5>
            <p class="card-text">Preparation Time: ${curRecipe.prepTime}</p>
            <p class="card-text">Likes: ${curRecipe.likes}</p>
            <p class="card-text"><small class="text-body-secondary">Uploaded ${curRecipe.uploadDate}</small></p>
          </div>
        </div>
      </div>`;
      recipeCard.addEventListener("click", function(){toRecipe(curRecipe._id)});
      recipeContainer.appendChild(recipeCard);

      let userRecipesNextPageDiv = document.createElement("div");
        userRecipesNextPageDiv.id = "userRecipesNextPageDiv"
        userRecipesNextPageDiv.addEventListener("click", function(){userRecipesNextPage()})
        userRecipesNextPageDiv.innerHTML = 
        `<button class="btn btn-secondary">Next</button>`
        let userRecipesPrevPageDiv = document.createElement("div");
        userRecipesPrevPageDiv.id = "userRecipesPrevPageDiv"
        userRecipesPrevPageDiv.addEventListener("click", function(){userRecipesPrevPage()})
        userRecipesPrevPageDiv.innerHTML = 
        `<button class="btn btn-secondary">Previous</button>`

      recipeContainer.appendChild(userRecipesNextPageDiv);
      recipeContainer.appendChild(userRecipesPrevPageDiv);

      if (userRecipeStartIndex == 0) {
        userRecipesPrevPageDiv.hidden = true;
      } else {
        userRecipesPrevPageDiv.hidden = false;
      }
      if (userRecipeStartIndex + 5 > profileData.userRecipes.length) {
        userRecipesNextPageDiv.hidden = true;
      } else {
        userRecipesNextPageDiv.hidden = false;
      }
      }
    }

    const loadLikedRecipes = () => {
      let recipeContainer = document.getElementById("likedRecipesContainer");
      recipeContainer.replaceChildren();
      if (likedRecipesList.length > 0) {
        for (let index = likedRecipeStartIndex; index < Math.min(likedRecipesList.length, likedRecipeStartIndex + 5); index++) {
          let curRecipe = likedRecipesList[index];
          let recipeCard = document.createElement("div");
          recipeCard.classList.add("card");
          recipeCard.innerHTML = 
          `<div class="row g-0" >
            <div class="col-sm-2">
              <img src=${curRecipe.image} class="img-fluid rounded-start profile-recipe-img" alt=${curRecipe.name}>
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">${curRecipe.name}</h5>
                <p class="card-text">Author: ${curRecipe.author}</p>
                <p class="card-text">Preparation Time: ${curRecipe.prepTime}</p>
                <p class="card-text">Likes: ${curRecipe.likes}</p>
                <p class="card-text"><small class="text-body-secondary">Uploaded ${curRecipe.uploadDate}</small></p>
              </div>
            </div>
          </div>`;
          recipeCard.addEventListener("click", function(){toRecipe(curRecipe._id)});
          recipeContainer.appendChild(recipeCard);
        }
        let likedRecipesNextPageDiv = document.createElement("div");
        likedRecipesNextPageDiv.addEventListener("click", function(){likedRecipesNextPage()})
        likedRecipesNextPageDiv.innerHTML = 
        `<button class="btn btn-secondary">Next</button>`
        let likedRecipesPrevPageDiv = document.createElement("div");
        likedRecipesPrevPageDiv.addEventListener("click", function(){likedRecipesPrevPage()})
        likedRecipesPrevPageDiv.innerHTML = 
        `<button class="btn btn-secondary">Previous</button>`

        recipeContainer.appendChild(likedRecipesNextPageDiv);
        recipeContainer.appendChild(likedRecipesPrevPageDiv);

        if (likedRecipeStartIndex == 0) {
          likedRecipesPrevPageDiv.hidden = true;
        } else {
          likedRecipesPrevPageDiv.hidden = false;
        }
        if (likedRecipeStartIndex + 5 > profileData.likedRecipes.length) {
          likedRecipesNextPageDiv.hidden = true;
        } else {
          likedRecipesNextPageDiv.hidden = false;
        }
      }
    }
    
    const userRecipesNextPage = () => {
      userRecipeStartIndex = likedRecipeStartIndex + 5;
      loadUserRecipes()
    }

    const userRecipesPrevPage = () => {
      userRecipeStartIndex = likedRecipeStartIndex - 5;
      loadUserRecipes()
    }

    const likedRecipesNextPage = () => {
      likedRecipeStartIndex = likedRecipeStartIndex + 5;
      loadLikedRecipes()
    }

    const likedRecipesPrevPage = () => {
      likedRecipeStartIndex = likedRecipeStartIndex - 5;
      loadLikedRecipes()
    }


    return (
      <div>
        <Navbar/>
        <div class="container-fluid">
          <h1>{profileData.username}</h1>
          <p>{profileData.totalLikes} likes</p>
          <h2>Recipes</h2>
          <hr/>
          <div id="userRecipesContainer">
          <hr/>
          </div>
          <h2>Liked Recipes</h2>
          <div id="likedRecipesContainer">
          </div>
        </div>
      </div>
    )
  }

  // Needs more Bootstrap
  const UploadRecipe = () => {
    let navigate = useNavigate();

    let date = new Date().toLocaleDateString()
    let numIngredients = 0;
    let numInstructions = 0;

    let ingredientsList = [];
    let instructionsList = [];

    const [recipeData, setRecipeData] = useState({
      name: "",
      author: "",
      uploadDate: date,
      image: "",
      prepTime: "",
      ingredients: [],
      instructions: [],
      likes: 0
    });

    useEffect(() => {
      console.log(recipeData)
      if (recipeData.ingredients.length > 0) {
      fetch(`http://localhost:8081/uploadRecipe/${recipeData.author}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeData)
      })
      .then(() => {navigate("/")})
      }
    }, [recipeData.ingredients]);

  const addIngredient = () => {
    numIngredients = numIngredients + 1;
    let ingredientsContainer = document.getElementById("ingredients");
    let newIngredient = `<input id='ingredientForm${numIngredients}' type="text" placeholder="Ingredient" required />`
    ingredientsContainer.insertAdjacentHTML("beforeend", newIngredient);
  }

  const removeIngredient = () => {
    if (numIngredients >= 1) {
      let ingredientsContainer= document.getElementById("ingredients");
      let removedIngredient = document.getElementById("ingredientForm" + numIngredients);
      ingredientsContainer.removeChild(removedIngredient);
      numIngredients = numIngredients - 1;
    }
  }

  const addInstruction = () => {
    numInstructions = numInstructions + 1;
    let instructionsContainer = document.getElementById("instructions");
    let newInstruction = `<input id='instructionForm${numInstructions}' type="text" placeholder="Instruction" required />`
    instructionsContainer.insertAdjacentHTML("beforeend", newInstruction);
  }

  const removeInstruction = () => {
    if (numInstructions >= 1) {
      let instructionsContainer= document.getElementById("instructions");
      let removedInstruction = document.getElementById("instructionForm" + numInstructions);
      instructionsContainer.removeChild(removedInstruction);
      numInstructions = numInstructions - 1;
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipeData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!signedIn) {
      navigate("/signIn");
    }
    for (var curIngredient = 0; curIngredient <= numIngredients; curIngredient++) {
      let curFormValue = document.getElementById("ingredientForm" + curIngredient).value;
      ingredientsList[curIngredient] = curFormValue;
    }
    console.log(ingredientsList)
    for (var curInstruction = 0; curInstruction <= numInstructions; curInstruction++) {
      let curFormValue = document.getElementById("instructionForm" + curInstruction).value;
      instructionsList[curInstruction] = curFormValue;
    }
    
    console.log("Setting data")
    setRecipeData(prevState => ({
      ...prevState,
      ["author"]: userData.username,
      ["ingredients"]: ingredientsList,
      ["instructions"]: instructionsList
    }));
  }

    return(
      <div>
        <Navbar/>
        <div class="container-fluid">
          <form class="form-group" onSubmit={handleSubmit}>
            <h1>Upload a Recipe</h1>
              <input type="text" name="name" value={recipeData.name} onChange={handleChange} placeholder="Recipe Name" required /> <br />
              <input type="text" name="prepTime" value={recipeData.prepTime} onChange={handleChange} placeholder="Preparation Time" required /> <br />
              <input type="text" name="image" value={recipeData.image} onChange={handleChange} placeholder="Image URL" required /> <br />
              <div id='ingredients'>
                <input id='ingredientForm0' type="text" placeholder="Ingredient" required />
              </div>
              <div id='instructions'>
                <input id='instructionForm0' type="text" placeholder="Instruction" required />
              </div>
              <button class="btn btn-warning" type="button" onClick={addIngredient}>Add Ingredient</button>
              <button class="btn btn-danger" type="button" onClick={removeIngredient}>Remove Ingredient</button>
              <button class="btn btn-warning" type="button" onClick={addInstruction}>Add Instruction</button>
              <button class="btn btn-danger" type="button" onClick={removeInstruction}>Remove Instruction</button>
              <button class="btn btn-success" type='submit'>Upload Recipe</button>
          </form>
        </div>
      </div>
    )
  }

  // Work-in-progress
  const Recipe = () => {
    const [recipePageData, setRecipePageData] = useState({
      name: "",
      author: "",
      uploadDate: "",
      image: "",
      prepTime: "",
      ingredients: [],
      instructions: [],
      likes: 0
    })

    useEffect(() => {
      fetch(`http://localhost:8081/recipe/id/${viewingRecipeId}`)
          .then((response) => response.json())
          .then((data) => {
            setRecipePageData(data);
          })
    }, []);

    useEffect(() => {
      loadRecipe()
      if (userData.likedRecipes.indexOf(recipePageData._id) == -1) {
        document.getElementById("likeButton").hidden = false;
        document.getElementById("unlikeButton").hidden = true;
      } else {
        document.getElementById("likeButton").hidden = true;
        document.getElementById("unlikeButton").hidden = false;
      }
    }, [recipePageData]) 

    const loadRecipe = () => {
      let recipeContainer = document.getElementById("recipePageContainer");
      recipeContainer.replaceChildren();
      let recipeInfo = document.createElement("div");
      recipeInfo.insertAdjacentHTML("beforeend", 
        `
        <h1> ${recipePageData.name} </h1> 
        <p> ${recipePageData.uploadDate} </p>
        <p> ${recipePageData.author} </p>
        <p> ${recipePageData.likes} likes </p>
        <p><strong>Preparation Time:</strong> ${recipePageData.prepTime} </p>`
      )
      // Recipe like button
      let recipeLikeButtonDiv = document.createElement("div");
      recipeLikeButtonDiv.id = "likeButton";
      recipeLikeButtonDiv.innerHTML = `<button class="btn btn-danger" type"button">Like Recipe</button>`
      recipeLikeButtonDiv.addEventListener("click", function(){likeRecipe()});
      // Recipe unlike button
      let recipeUnlikeButtonDiv = document.createElement("div");
      recipeUnlikeButtonDiv.id = "unlikeButton";
      recipeUnlikeButtonDiv.innerHTML = `<button class="btn btn-primary" type"button">Unlike Recipe</button>`
      recipeUnlikeButtonDiv.addEventListener("click", function(){unlikeRecipe()});
      // Image container
      let recipeImageDiv = document.createElement("div");
      recipeImageDiv.className = "recipe-image";
      recipeImageDiv.insertAdjacentHTML("beforeend", `<img class="recipe-page-img" src= "${recipePageData.image}"></img>`);
      // Create the list of ingredients
      let ingredientDiv = document.createElement("div");
      ingredientDiv.className = "ingredients";
      ingredientDiv.insertAdjacentHTML("beforeend", `<h2 style="strong" class="heading">Ingredients</h2>`)
      let ulIngredients = document.createElement("ul");
      for (var ingredient in recipePageData.ingredients) {
          var liIngredient = document.createElement("li");
          liIngredient.appendChild(document.createTextNode(recipePageData.ingredients[ingredient]));
          ulIngredients.appendChild(liIngredient);
      }
      ingredientDiv.appendChild(ulIngredients);
      // Create the list of instructions
      var instructionDiv = document.createElement("div");
      instructionDiv.className = "instructions";
      instructionDiv.insertAdjacentHTML("beforeend", `<h2 style="strong" class="heading">Instructions</h2>`)
      var olInstructions = document.createElement("ol");
      for (var instruction in recipePageData.instructions) {
          var liInstruction = document.createElement("li");
          liInstruction.appendChild(document.createTextNode(recipePageData.instructions[instruction]));
          olInstructions.appendChild(liInstruction);
      }
      instructionDiv.appendChild(olInstructions);
      recipeContainer.appendChild(recipeInfo);
      recipeContainer.appendChild(recipeLikeButtonDiv);
      recipeContainer.appendChild(recipeUnlikeButtonDiv);
      recipeContainer.appendChild(recipeImageDiv);
      recipeContainer.appendChild(ingredientDiv);
      recipeContainer.appendChild(instructionDiv);
    }

    const likeRecipe = () => {
        console.log("Liking recipe")
        fetch(`http://localhost:8081/likeRecipe/${recipePageData._id}/${recipePageData.author}/${userData.username}`, {
        method: "POST",
        body: ""
        })
        .then((response) => {
          if (response == 200) {
            console.log("Recipe liked successfully")
          } else {
            console.log(response);
          }
        })

        document.getElementById("likeButton").hidden = true;
        document.getElementById("unlikeButton").hidden = false;
    }

    const unlikeRecipe = () => {
        console.log("Unliking recipe")
        fetch(`http://localhost:8081/unlikeRecipe/${recipePageData._id}/${recipePageData.author}/${userData.username}`, {
        method: "POST",
        body: ""
        })
        .then((response) => {
          if (response == 200) {
            console.log("Recipe liked successfully")
          } else {
            console.log(response);
          }
        })

        document.getElementById("likeButton").hidden = false;
        document.getElementById("unlikeButton").hidden = true;
    }

    return (
      <div>
        <Navbar/>
        <div id="recipePageContainer">
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/createAccount" element={<CreateAccount/>}/>
      <Route path="/signIn" element={<SignIn/>}/>
      <Route path="/signOut" element={<SignOut/>}/>
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/uploadRecipe" element={<UploadRecipe/>}/>
      <Route path="/recipe" element={<Recipe/>}/>
    </Routes>
  );
}

export default App;
