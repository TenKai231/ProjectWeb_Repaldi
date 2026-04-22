document.addEventListener("DOMContentLoaded", function(){

    const profileBtn = document.getElementById("profileBtn");
    const panel = document.getElementById("profilePanel");
    const closeBtn = document.getElementById("closeBtn");

    const viewName = document.getElementById("viewName");
    const viewEmail = document.getElementById("viewEmail");
    const viewAddress = document.getElementById("viewAddress");
    const avatarText = document.getElementById("avatarText");

    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");

    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editAddress = document.getElementById("editAddress");

    const profileView = document.getElementById("profileView");
    const profileEdit = document.getElementById("profileEdit");

    profileBtn.onclick = () => panel.classList.add("active");
    closeBtn.onclick = () => panel.classList.remove("active");

    const saved = JSON.parse(localStorage.getItem("profileData"));
    if(saved){
        viewName.textContent = saved.name;
        viewEmail.textContent = saved.email;
        viewAddress.textContent = saved.address;
        const initial = saved.name.charAt(0).toUpperCase();
        avatarText.textContent = initial;
        profileBtn.textContent = initial;
    }

    editBtn.onclick = () => {
        profileView.style.display="none";
        profileEdit.style.display="block";

        editName.value = viewName.textContent;
        editEmail.value = viewEmail.textContent;
        editAddress.value = viewAddress.textContent;
    };

    saveBtn.onclick = () => {
        viewName.textContent = editName.value;
        viewEmail.textContent = editEmail.value;
        viewAddress.textContent = editAddress.value;

        const initial = editName.value.charAt(0).toUpperCase();
        avatarText.textContent = initial;
        profileBtn.textContent = initial;

        localStorage.setItem("profileData", JSON.stringify({
            name: editName.value,
            email: editEmail.value,
            address: editAddress.value
        }));

        profileEdit.style.display="none";
        profileView.style.display="block";
    };

});