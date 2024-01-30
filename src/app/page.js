"use client"
import React, { useState } from 'react';
import axios from 'axios';
import cytoscape from 'cytoscape';
import { Parser as SparqlParser } from 'sparqljs';


const executeQuery = async (query) => {

  const endpoint = 'http://dbpedia.org/sparql';

  try {

    const response = await axios.get(endpoint, {
      params: {
        query: query,
        format: 'json', 
      },
    });


    return response.data.results.bindings;
  } catch (error) {
    console.error('Error executing SPARQL query:', error);
    throw error;
  }
};

const DbpediaQueryPage = () => {
  const [queryResult, setQueryResult] = useState(null);

  const handleFetchAndRenderGraph = async () => {
    try {

      const query = `
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?country ?countryLabel
        WHERE {
          ?country a dbo:Country .
          ?country rdfs:label ?countryLabel .
          FILTER(LANG(?countryLabel) = 'en')
        }
        LIMIT 10
      `;

      const result = await executeQuery(query);
      setQueryResult(result);

      // Render Cytoscape graph
      renderGraph(result);
    } catch (error) {
      console.error('Error executing query:', error);
    }
  };

  const renderGraph = (data) => {

    const cy = cytoscape({
      container: document.getElementById('cy'), 
      elements: [], 
      style: [ 
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }
      ]
    });

  
    data.forEach(item => {
      cy.add({
        data: { id: item.countryLabel.value }
      });
    });

    cy.layout({ name: 'grid' }).run();
  };

  return (
    <div>
      <h1>DBpedia Query Page</h1>
      <button onClick={handleFetchAndRenderGraph}>Fetch and Render Graph</button>
      <div id="cy" style={{ height: '400px', width: '100%' }}></div>
      <script src="cytoscape.min.js"></script>
    </div>
  );
};

export default DbpediaQueryPage;


     