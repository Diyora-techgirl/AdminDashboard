
async function postData(url = '', data = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error; 
    }
  }
  
  function collectFormData() {
    const firstname = document.getElementById('firstname').value;
    const surname = document.getElementById('Surname').value;
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const image = document.getElementById('imageInput').value;
  
    return {
      id:login,
      firstName: firstname,
      lastName: surname,
      login: login,
      password: password,
      email: email,
      image: image,
    };
  }
  
  function postFormData() {
    const formData = collectFormData();
  
    postData('http://localhost:3000/admin', formData)
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
  document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
    postFormData();
  });
  
  function displayImageInputValue(event) {
    const inputValue = event.target.value;
    const img = document.getElementById("img");
    img.src = inputValue;
}


function saveToDraft() {
    const formElements = document.querySelectorAll('input, textarea, select');
    const formData = {};
    formElements.forEach(element => {
        if (element.name) { 
            formData[element.name] = element.value;
        }
    });
   
    localStorage.setItem('draftFormData', JSON.stringify(formData));
    alert('Form data saved to draft!');
}

function populateFormFromDraft() {
    const draftFormDataString = localStorage.getItem('draftFormData');
    if (draftFormDataString) {
        const draftFormData = JSON.parse(draftFormDataString);
        for (const key in draftFormData) {
            if (Object.hasOwnProperty.call(draftFormData, key)) {
                const value = draftFormData[key];
                const formElement = document.querySelector(`[name="${key}"]`);
                if (formElement) {
                        formElement.value = value;
                    }
                }
            }
        }
    }

document.addEventListener('DOMContentLoaded', function() {
        populateFormFromDraft();
    });

function validateNumber(event) {
    const input = event.target;
    const value = input.value.trim();
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    input.value = sanitizedValue;
}

async function fetchAdminData() {
    try {
        const response = await fetch('http://localhost:3000/admin');
        if (!response.ok) {
            throw new Error('Failed to fetch admin data');
        }
        const adminData = await response.json();
        return adminData;
    } catch (error) {
        console.error('Error fetching admin data:', error.message);
        return [];
    }
}

async function displayAdmins() {
    let a = 1;
    const tableBody = document.getElementById('adminTableBody');
    if (!tableBody) {
        console.error("adminTableBody element not found");
        return;
    }

    try {
        const adminData = await fetchAdminData();
        console.log(adminData)
        tableBody.innerHTML = '';
        adminData.forEach(admin => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${a++}</td>
                <td>${admin.firstName}</td>
                <td>${admin.lastName}</td>
                <td>${admin.login}</td>
                <td>${admin.password}</td>
                <td>${admin.email}</td>
                <td><img src="${admin.image}" alt="Admin Image"></td>
                <td><button class="deleteBtn"><i class="fa-solid fa-trash"data-id="${admin.id}"></i></button>
                 <button class="editBtn"><i class="fa-solid fa-pen-to-square" data-id="${admin.id}"></i></button>
                 </td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error displaying admin data:', error.message);
    }
    
}
function deleteAdminRow(id) {
    fetch(`http://localhost:3000/admin/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            const row = document.querySelector(`[data-id="${id}"]`).closest('tr');
            if (row) {
                row.remove();
            }
        } else {
            console.error('Failed to delete admin row');
        }
    })
    .catch(error => {
        console.error('Error deleting admin row:', error);
    });
}


// edit button function=========================================
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm'); 

function editAdminRow(id) {
    console.log(id)
    fetch(`http://localhost:3000/admin/${id}`)

        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('editFirstName').value = data.firstName;
            document.getElementById('editLastName').value = data.lastName;
            document.getElementById('editLogin').value = data.login;
            document.getElementById('editPassword').value = data.password;
            document.getElementById('editEmail').value = data.email;
            document.getElementById('editImage').value = data.image;

            editModal.style.display = 'block';
            document.querySelector(".edit-backdrop").style.display="block"
        })
        .catch(error => console.error('Error fetching admin data:', error));
}

editModal.querySelector('.close').addEventListener('click', () => {
    editModal.style.display = 'none';
    document.querySelector(".edit-backdrop").style.display="none"
});


window.addEventListener('click', event => {
    if (event.target.classList.contains('modal')) {
        editModal.style.display = 'none';
        document.querySelector(".edit-backdrop").style.display = "none";
    }
});


// Submit the edited data
editForm.addEventListener('submit', event => {
    event.preventDefault();
    const id = document.getElementById('editLogin').value; // Get the admin ID

    // Gather the edited data
    const formData = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        login: document.getElementById('editLogin').value,
        password: document.getElementById('editPassword').value,
        email: document.getElementById('editEmail').value,
        image: document.getElementById('editImage').value
    };

    // Send the edited data to the server
    fetch(`http://localhost:3000/admin/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Admin edited:', data);
        editModal.style.display = 'none'; 
        document.querySelector(".edit-backdrop").style.display = "none";
        displayAdmins();
    })
    .catch(error => console.error('Error editing admin:', error));
});


displayAdmins().then(() => {
    document.querySelectorAll(".editBtn").forEach(button=>{
        button.addEventListener("click", e=>{
            e.preventDefault()
            const id = e.target.dataset.id;
            console.log(id)
            if (id) {
                editAdminRow(id);
            }
        })
    })
    document.querySelectorAll('.deleteBtn').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault()
            console.log(event.target.dataset.id)
            const id = event.target.dataset.id;
            console.log(id)
            if (id) {
                deleteAdminRow(id);
            }
        });
    });
});




