const express = require('express');
const axios = require('axios');
const app = express();

// Fetch numbers from a single URL and handle timeouts
async function fetchNumbersFromURL(url, timeout) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request to ${url} timed out`));
    }, timeout);

    axios.get(url)
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response.data);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// Fetch numbers from multiple URLs and combine them into a single array
async function fetchNumbersFromURLs(urls, timeout) {
  const promises = urls.map(url => fetchNumbersFromURL(url, timeout));
  const responses = await Promise.allSettled(promises);

  const numbers = responses
    .filter(response => response.status === 'fulfilled')
    .flatMap(response => response.value);

  return numbers;
}

// Bubble sort implementation to sort numbers in ascending order
function bubbleSort(numbers) {
  const length = numbers.length;
  let swapped;
  
  do {
    swapped = false;
    for (let i = 0; i < length - 1; i++) {
      if (numbers[i] > numbers[i + 1]) {
        const temp = numbers[i];
        numbers[i] = numbers[i + 1];
        numbers[i + 1] = temp;
        swapped = true;
      }
    }
  } while (swapped);
}

// Example API endpoint for fetching and sorting numbers
app.get('/sorted-numbers', async (req, res) => {
  const { urls } = req.query;
  const timeout = 500; // Time constraint in milliseconds

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid URLs provided' });
  }

  try {
    const numbers = await fetchNumbersFromURLs(urls, timeout);
    const uniqueNumbers = [...new Set(numbers)]; // Remove duplicates
    bubbleSort(uniqueNumbers); // Sort in ascending order using bubble sort
    res.json({ numbers: uniqueNumbers });
  } catch (error) {
    console.error('Error fetching or sorting numbers:', error);
    res.status(500).json({ error: 'Failed to fetch or sort numbers' });
  }
});

// Start the server
const port = 8008; // Change to port 8008
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
