import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min';
import $ from 'jquery';

import { useState, useEffect } from 'react';

function IngredientSearch(){

    const [filteredProducts, setfilteredProducts] = useState([])

    fetch(`http://localhost:8081/recipes`)
          .then((response) => response.json())
          .then((data) => {
                console.log("Recipes from ingredient search: ",data)
                setfilteredProducts(data);
          });
          
          return (
            <div>
              {filteredProducts.map((el) => (
                <div key={el.id}>
                  <img src={el.image} alt="product" width={30} />
                  <div>Title: {el.name}</div>
                  <div>Ingredients: {el.ingredients}</div>
                  <div>Author: {el.author}</div>
                  <div>Likes: {el.likes}</div>
                </div>
              ))}
            </div>
          );
}

export default IngredientSearch;