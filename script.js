// Get the modal
var modal = document.getElementById("myModal");

// Get the images and insert them inside the modal - use their "src" attribute as the path
var images = document.querySelectorAll('.grid-item img');
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
images.forEach(img => {
  img.onclick = function() {
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
  }
});

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// Close the modal if the user clicks anywhere outside of the modal content
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
