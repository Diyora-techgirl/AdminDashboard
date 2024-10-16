
async function checkUserType(login, password) {
  try {
    
      const superadminResponse = await fetch("http://localhost:3000/superadmin");
      if (!superadminResponse.ok) {
          throw new Error('Failed to fetch superadmin data');
      }
      const superadminData = await superadminResponse.json();

   
      const adminResponse = await fetch("http://localhost:3000/admin");
      if (!adminResponse.ok) {
          throw new Error('Failed to fetch admin data');
      }
      const adminData = await adminResponse.json();

     
      const superadminMatch = superadminData.find(user => user.login === login && user.password === password);
      if (superadminMatch) {
          return "superadmin";
      }


      const adminMatch = adminData.find(user => user.login === login && user.password === password);
      if (adminMatch) {
          return "admin";
      }

 
      return "unknown";
  } catch (error) {
      console.error("Error:", error);
      throw error;
  }
}


async function handleLogin() {
  const loginValue = document.querySelector(".login").value;
  const passValue = document.querySelector(".password").value;
  const error = document.querySelector(".error_message");

  try {
    const userType = await checkUserType(loginValue, passValue);
    console.log("User type:", userType);
    if (userType === "superadmin" || userType === "admin") {
      localStorage.setItem("token", userType);
      error.classList.add("success");
      error.innerHTML=`
       <h4>login successfull</h4>
      <span class="line"></span>`
      error.style.display="block";

      setTimeout(() => {
        error.style.display = "none";
        error.classList.remove("success")
        window.location.href = `../../../../index.html`;
    }, 4000);
        
    } else {
       
        if (error) {
           error.classList.add("error")
           error.innerHTML=`
           <h4>login or password is invalid</h4>
          <span class="line"></span>`
            error.style.display = "block";
           
            setTimeout(() => {
                error.style.display = "none";
                error.classList.remove("error")
            }, 4000);
        } else {
            console.error("Error message element not found.");
        }
    }
} catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again later.");
}


}

const loginForm = document.querySelector("#loginForm");
loginForm.addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent form submission
  handleLogin();
});


