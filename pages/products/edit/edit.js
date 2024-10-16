let selectedProductId=null;
document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const rowsPerPage = 5; 

    async function fetchProducts(page) {
        const url = `http://localhost:3000/products?_page=${page}&_limit=${rowsPerPage}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error; // Re-throw the error to propagate it to the caller
        }
    }

    function populateTable(data) {
        const tableBody = document.querySelector('#productTable tbody');
        tableBody.innerHTML = ''; 
        data.forEach(product => {
            const row = document.createElement('tr');
            const descriptionSubstring = product.description.substring(0, 50);
            row.innerHTML = `
                <td><img src="${product.images[0]}" alt="${product.name}" width="100"></td> 
                <td>${product.title}</td>
                <td>${descriptionSubstring}...</td> <!-- Displaying the substring -->
                <td>${product.price}</td>
                <td>${product.category}</td>
                <td><button type="button" class="delete-btn" data-id="${product.id}">Delete</button> <button type="button" class="edit-btn" data-id="${product.id}">Edit</button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    function displayData(page) {
        fetchProducts(page)
            .then(data => {
                populateTable(data);
                currentPage = page;
                updatePagination();
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    function updatePagination() {
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        const pageNumDisplay = document.getElementById('page-num');

        pageNumDisplay.textContent = `Page ${currentPage}`;

        if (currentPage === 1) {
            prevButton.disabled = true;
        } else {
            prevButton.disabled = false;
        }
        fetchProducts(currentPage + 1)
            .then(data => {
                console.log(data)
                if (data.length === 0) {
                    nextButton.disabled = true;
                } else {
                    nextButton.disabled = false;
                }
            })
            .catch(error => console.error('Error fetching products for pagination:', error));
    }

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            displayData(currentPage - 1); 
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        displayData(currentPage + 1); 
    });

    document.querySelector('#productTable').addEventListener('click', event => {
        event.preventDefault()
        if (event.target.classList.contains('delete-btn')) {
            const productId = event.target.dataset.id; // Retrieve product ID from dataset
            if (productId) {
                
                deleteProduct(productId);
            } else {
                console.error('Product ID is null or undefined');
            }
        }
        else if(event.target.classList.contains('edit-btn')){ // Corrected to 'edit-btn'
            const productId = event.target.dataset.id;
            if (productId) {
                selectedProductId=productId
                openEditModal(productId); // Call the function to open edit modal
            } else {
                console.error('Product ID is null or undefined');
            }
        }
    });

    function deleteProduct(productId) {
        fetch(`http://localhost:3000/products/${productId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            // Refresh the current page after successful deletion
            displayData(currentPage);
        })
        .catch(error => console.error('Error deleting product:', error));
    }

    displayData(currentPage);
});

function openEditModal(productId) {
    const modal = document.getElementById('editModal');
    const editForm = modal.querySelector('#editForm');

    // Fetch categories
    fetch('http://localhost:3000/categories')
        .then(response => response.json())
        .then(categories => {
            // Populate category dropdown
            const categorySelect = editForm.querySelector('#category');
            categorySelect.innerHTML = ''; // Clear previous options
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });

            // Fetch product details
            fetch(`http://localhost:3000/products/${productId}`)
                .then(response => response.json())
                .then(product => {
                    // Populate form fields with product data
                    editForm.querySelector('#title').value = product.title;
                    editForm.querySelector('#description').value = product.description;
                    editForm.querySelector('#price').value = product.price;
                    editForm.querySelector('#category').value = product.category

                    // Show the modal
                    modal.style.display = 'block';
                })
                .catch(error => console.error('Error fetching product details:', error));
        })
        .catch(error => console.error('Error fetching categories:', error));
}


// Close edit modal when clicking on close button
const closeBtn = document.querySelector('.close');
closeBtn.addEventListener('click', function() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
});

// Close edit modal when clicking outside the modal
window.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

editForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Extract edited data from form fields
    const editedProduct = {
        title: editForm.querySelector('#title').value,
        description: editForm.querySelector('#description').value,
        price: editForm.querySelector('#price').value,
        category: editForm.querySelector('#category').value,
        images: editForm.querySelector('#image').value
    };

    // Fetch the product ID
    
    
    // Send a PUT request to update the product data
    fetch(`http://localhost:3000/products/${selectedProductId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedProduct)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update product');
        }
        console.log('Product updated successfully');
        const modal = document.getElementById('editModal');
        modal.style.display = 'none';
        displayData(currentPage);
    })
    .catch(error => console.error('Error updating product:', error));
});

