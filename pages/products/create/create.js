// Define global variables
let imageUrls = [];
let addMoreButton;
let imagePreviewDiv;
let isFirstImagePreviewDiv = true;

function handleImageSelect(event) {
    const imageUrlInput = event.target.value.trim();
    const imagePreviewDiv = event.target.closest('.media').querySelector('.imagePreview');
    
    const imgElement = document.createElement('img');
    imgElement.src=''
    imgElement.src = imageUrlInput;
    imgElement.alt = 'Uploaded image';

    imagePreviewDiv.innerHTML = '';
    imagePreviewDiv.appendChild(imgElement);

    imageUrls.push(imageUrlInput);
}

// Function to handle adding more input fields
function handleAddMore() {
    const mediaContainer = document.querySelector('.media');

    const inputContainer = document.querySelector('.URLinputs');
    const newInpContainer = document.createElement("div");
    newInpContainer.classList.add("container-input");
    inputContainer.appendChild(newInpContainer);

    // Create a new input field
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.required = true;
    newInput.classList.add('images');
    newInput.setAttribute("id", "imageInputs");
    newInput.addEventListener('change', handleImageSelect); // Add event listener to handle image change
    newInpContainer.appendChild(newInput);

    // Create a delete button
    const deleteButton = document.createElement('button');
    deleteButton.classList.add("delete");
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        // Remove the input container when delete button is clicked
        inputContainer.removeChild(newInpContainer);
    });
    newInpContainer.appendChild(deleteButton);

    // Append the input container to the media container
    mediaContainer.appendChild(inputContainer);
}

document.addEventListener('DOMContentLoaded', function() {
    const draftFormDataString = localStorage.getItem('draftFormData');
    if (draftFormDataString) {
        const draftFormData = JSON.parse(draftFormDataString);
        console.log(draftFormData);
    } else {
        console.log('No draft form data found in localStorage.');
    }

    // Function to handle form submission
    document.querySelector(".form").addEventListener('submit', (e) => {
        e.preventDefault();
        const allowReload = window.confirm('Are you sure you want to submit the form? This will reload the page.');
        
        if (allowReload) {
            localStorage.removeItem('draftFormData');
            const formData = new FormData(e.currentTarget);
            const formObject = Object.fromEntries(formData);
            console.log(formObject);
            
            const productData = {
                title: formObject.productTitle,
                description: formObject.description,
                price: "$"+ formObject.price,
                category: formObject.category,
                images: imageUrls, // Assign the imageUrls array
                comments: []
            };

            // Make a POST request to the JSON server's endpoint for adding products
            fetch('http://localhost:3000/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add product');
                }
                return response.json();
            })
            .then(data => {
                console.log('Product added successfully:', data);
                e.currentTarget.reset();
                imageUrls = []; // Reset the imageUrls array

                // Clear the image preview
                document.getElementById('imagePreview').innerHTML = '';
            })
            .catch(error => {
                console.error('Error adding product:', error);
            });
        }
    });

    // Populate form with draft form data
    populateFormFromDraft();
});

function saveToDraft() {
    const formElements = document.querySelectorAll('input, textarea, select');
    const formData = {};
    const imageUrls = [];
    formElements.forEach(element => {
        if (element.name && element.name !== 'images') { // Exclude 'images' key
            formData[element.name] = element.value;
        }
    });
    const imageInputs = document.querySelectorAll('.images'); // Select inputs with class 'images'
    imageInputs.forEach(input => {
        imageUrls.push(input.value.trim());
    });

    formData.imageUrls = imageUrls;

    localStorage.setItem('draftFormData', JSON.stringify(formData));
    alert('Form data saved to draft!');
}

function validateNumber(event) {
    const input = event.target;
    const value = input.value.trim();
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    input.value = sanitizedValue;
}

async function populateCategories() {
    try {
        const response = await fetch('http://localhost:3000/categories');
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        const selectElement = document.getElementById('category');
        data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}
populateCategories();

function populateFormFromDraft() {
    const draftFormDataString = localStorage.getItem('draftFormData');
    if (draftFormDataString) {
        const draftFormData = JSON.parse(draftFormDataString);
        for (const key in draftFormData) {
            if (Object.hasOwnProperty.call(draftFormData, key)) {
                const value = draftFormData[key];
                const formElement = document.querySelector(`[name="${key}"]`);
                if (formElement) {
                    // Check if the key is 'imageUrls'
                    if (key === 'imageUrls') {
                        const imageInputs = document.querySelectorAll('.images');
                        imageInputs.forEach((input, index) => {
                            input.value = value[index] || ''; // Assign the URL at the corresponding index or empty string
                        });
                    } else {
                        // Otherwise, populate other form elements
                        formElement.value = value;
                    }
                }
            }
        }
    }
}
