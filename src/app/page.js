"use client";
import React, { useState } from "react";
import axios from "axios";
import cytoscape from "cytoscape";
import cola from "cytoscape-cola";

cytoscape.use(cola);

const executeQuery = async (query) => {
  const endpoint = "http://dbpedia.org/sparql";

  try {
    const response = await axios.get(endpoint, {
      params: {
        query: query,
        format: "json",
      },
    });

    return response.data.results.bindings;
  } catch (error) {
    console.error("Error executing SPARQL query:", error);
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
        SELECT ?country ?countryLabel ?capital ?capitalLabel
        WHERE {
          ?country a dbo:Country .
          ?country rdfs:label ?countryLabel .
          ?country dbo:capital ?capital .
          ?capital rdfs:label ?capitalLabel .
          FILTER(LANG(?countryLabel) = 'en')
          FILTER(LANG(?capitalLabel) = 'en')
        }
        LIMIT 10
      `;

      const result = await executeQuery(query);
      setQueryResult(result);

      renderGraph(result);
    } catch (error) {
      console.error("Error executing query:", error);
    }
  };

  const renderGraph = (data) => {
    const cy = cytoscape({
      container: document.getElementById("cy"),
      elements: [],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#66c2ff",
            label: "data(label)",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
          },
        },
      ],
      layout: {
        name: "cola",
        nodeSpacing: 100,
        edgeLengthVal: 50,
        animate: true,
        randomize: true,
      },
    });

    data.forEach((item) => {
      cy.add([
        {
          data: { id: item.countryLabel.value, label: item.countryLabel.value },
        },
        {
          data: { id: item.capitalLabel.value, label: item.capitalLabel.value },
        },
        {
          data: {
            source: item.countryLabel.value,
            target: item.capitalLabel.value,
          },
        },
      ]);
    });
  };

  return (
    <div>
      <h1>DBpedia Query Page</h1>
      <button onClick={handleFetchAndRenderGraph}>
        Fetch and Render Graph
      </button>
      <div id="cy" style={{ height: "600px", width: "100%" }}></div>
      <script src="cytoscape.min.js"></script>
      <script src="cytoscape-cola/cytoscape-cola.js"></script>
    </div>
  );
};

export default DbpediaQueryPage;
