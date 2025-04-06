const carousel = document.querySelector('.stekjes-carousel')
const items = carousel.querySelectorAll('.stekje-card')
const next = document.querySelector('#next')
const prev = document.querySelector('#prev')


let currentIndex = 0

// Zet de actieve kaart en verwijder actief van de rest
function updateActive(index) {
  items.forEach(item => item.classList.remove('active'))
  items[index]?.classList.add('active') // alleen toevoegen als item bestaat
}

// Scroll soepel naar een kaart en update actieve status
function scrollToItem(index) {
  if (!items[index]) return
  items[index].scrollIntoView({ behavior: 'smooth', inline: 'center' })
  updateActive(index)
  currentIndex = index
}

// Volgende knop: ga naar volgende kaart
next.addEventListener('click', () => {
  if (currentIndex < items.length - 1) scrollToItem(currentIndex + 1)
})

// Vorige knop: ga naar vorige kaart
prev.addEventListener('click', () => {
  if (currentIndex > 0) scrollToItem(currentIndex - 1)
})

// Bij het laden: eerste kaart actief maken zonder scroll
updateActive(currentIndex)
