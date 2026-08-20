const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

const collaboratorFiles = [
  'appgm.png',
  'art gallery.png',
  'artisan market.png',
  'bakemates.png',
  'ekuinas.png',
  'glamping .png',
  'insken.png',
  'kolej komuniti.png',
  'light in the sea.png',
  'mara.png',
  'mror.png',
  'mtib.png',
  'muaythai.png',
  'ntw.png',
  'pks.png',
  'politeknik.png',
  'risda.png',
  'riuh .png',
  'rtm.png',
  'scenic.png',
  'shell livewire.png',
  'sicc.png',
  'sosea.png',
  'the art.png',
  'the pari.png',
  'yayasan axiata.png',
  'yayasan hasanah',
]

const displayName = (file) =>
  file
    .replace(/\.png$/i, '')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

function LogoCard({ file }) {
  return (
    <div className="collab-card" title={displayName(file)}>
      <img
        src={asset(`collabolator brutti/${file}`)}
        alt={`${displayName(file)} logo`}
        loading="lazy"
      />
    </div>
  )
}

function Collaborators() {
  const firstRow = collaboratorFiles.filter((_, index) => index % 2 === 0)
  const secondRow = collaboratorFiles.filter((_, index) => index % 2 === 1)

  return (
    <section className="collaborators-section" aria-label="Strategic collaborators">
      <div className="collaborators-head page-shell">
        <div>
          <p className="collaborators-eyebrow">Our network</p>
          <h2>Strategic <em>collaborators.</em></h2>
        </div>
        <p className="collaborators-copy">
          Organisations, communities and partners who have been part of Brutti&apos;s journey.
        </p>
      </div>

      <div className="collaborators-marquee" aria-hidden="false">
        <div className="collaborators-row collaborators-row--left">
          <div className="collaborators-track">
            {[...firstRow, ...firstRow].map((file, index) => (
              <LogoCard key={`row1-${file}-${index}`} file={file} />
            ))}
          </div>
        </div>

        <div className="collaborators-row collaborators-row--right">
          <div className="collaborators-track collaborators-track--reverse">
            {[...secondRow, ...secondRow].map((file, index) => (
              <LogoCard key={`row2-${file}-${index}`} file={file} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Collaborators
