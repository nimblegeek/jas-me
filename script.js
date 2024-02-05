document.addEventListener('DOMContentLoaded', function() {
  const images = [
    { src: 'atomic essays/healthorwealth.png', alt: 'Placeholder' },
    { src: 'path/to/image2.jpg', alt: 'Placeholder' },
    { src: 'path/to/image3.jpg', alt: 'Placeholder' },
    { src: 'path/to/image4.jpg', alt: 'Placeholder' },
    // Add more images as needed
  ];

  const container = document.getElementById('gridContainer');
  images.forEach(image => {
    const div = document.createElement('div');
    div.className = 'grid-item';
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt;
    div.appendChild(img);
    container.appendChild(div);
  });
});

// Get the modal
var modal = document.getElementById("myModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
document.querySelectorAll('.grid-item img').forEach(item => {
  item.onclick = function() {
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

// Optionally, close the modal when clicking outside the image
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
