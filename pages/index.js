import Image from 'next/image'
import profilePic from '../public/logo.svg'

function HomePage() {

  return (
    <>
      <Image
        src={profilePic}
        alt="Jon Sarkin"
        width={400} // automatically provided
        height={100} // automatically provided
        // blurDataURL="data:..." automatically provided
        // placeholder="blur" // Optional blur-up while loading
      />
      <p>One piece of artwork - mint on any chain you want.</p>
      <p>
        Priced based on specificity. If you're OK with a random one, it's
        cheap. If you want a <em>specific</em> piece, it's more expensive.
      </p>
      <p>[Piece filter]</p>
      <p>Priced in fiat with oracles. Pick your blockchain.</p>
    </>
  )
}

export default HomePage