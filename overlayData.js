// overlayData.js

export const overlayData = {
  works: {
    sections: [
      {
        // Section for "PUBLIC"
        note: { x: 140, y: 105, cls: 'black', txt: 'PUBLIC', fontSize: '22px' },
        projects: [
          {
            x: 140, y: 200,
            imageUrl: './assets/thumbnail/NMB-tn.jpg',
            title: 'Neural Monobloc Black',
            type: 'AI Research',
            url: './works/neuralmonoblack.html'
          },
          {
            x: 500, y: 200,
            imageUrl: './assets/thumbnail/NAB-tn.jpg',
            title: 'Neural Artefact Black',
            type: 'AI Research',
            url: './works/neuralartefactblack.html'
          },
          {
            x: 320, y: 450,
            imageUrl: './assets/thumbnail/GI-tn.jpg',
            title: 'Generative Ipse',
            type: 'AI Research',
            url: './works/generativeipse.html'
          },
          {
            x: 680, y: 450,
            imageUrl: './assets/thumbnail/NPK-tn.jpg',
            title: 'Neural Palate Kueh',
            type: 'AI Research',
            url: './works/neuralpalatekueh.html'
          },
        ]
      },
      {
        // Section for "SCHOOL"
        note: { x: 1220,  y: 205,  cls: 'black', txt: 'SCHOOL', fontSize: '22px' },
        projects: [
          {
            x: 1400, y: 300,
            imageUrl: './assets/thumbnail/TMN-tn.jpg',
            title: 'To Mother Nature',
            type: 'Urbanism',
            url: './works/tomothernature.html'
          },
          {
            x: 1760, y: 300,
            imageUrl: './assets/thumbnail/NewOp-tn.jpg',
            title: 'New Operaism',
            type: 'Urbanism',
            url: './works/newoperaism.html'
          },
          {
            x: 2120, y: 300,
            imageUrl: './assets/thumbnail/RhMh-tn.png',
            title: 'Rehabilitation Machine',
            type: 'Architecture',
            url: './works/rehabilitationmachine.html'
          },
          {
            x: 1220, y: 550,
            imageUrl: './assets/thumbnail/GuGoo-tn.jpg',
            title: 'Gulu Goolu',
            type: 'Urbanism',
            url: './works/gulugoolu.html'
          },
          {
            x: 1580, y: 550,
            imageUrl: './assets/thumbnail/C10-tn.jpg',
            title: 'Cloud 10',
            type: 'Architecture',
            url: './works/cloud10.html'
          },
          {
            x: 1940, y: 550,
            imageUrl: './assets/thumbnail/MhCf-tn.JPG',
            title: 'Machine Crafted',
            type: 'Experimental',
            url: './works/machinecrafted.html'
          },
          {
            x: 2300, y: 550,
            imageUrl: './assets/thumbnail/Cd-tn.jpg',
            title: 'Crescendo',
            type: 'Architecture',
            url: './works/crescendo.html'
          },
          {
            x: 1400, y: 800,
            imageUrl: './assets/thumbnail/DDF-tn.png',
            title: 'Digital Design & Fabrication',
            type: 'Canopy',
            url: './works/leafy.html'
          },
          {
            x: 1760, y: 800,
            imageUrl: './assets/thumbnail/Yz-tn.jpg',
            title: "Yaqzans' Space",
            type: 'Architecture',
            url: './works/yaqzansspace.html'
          },
          {
            x: 2120, y: 800,
            imageUrl: './assets/thumbnail/Pt-tn.png',
            title: 'Points',
            type: 'Architecture',
            url: './works/points.html'
          },
        ]
      },
      {
        // Section for "OTHERS"
        note: { x: 320,  y: 805, cls: 'black', txt: 'OTHERS', fontSize: '22px' },
        projects: [
          {
            x: 320, y: 900,
            imageUrl: './assets/thumbnail/HmNt-tn.png',
            title: 'Human | Nature',
            type: 'Experiment',
            url: './works/humannature.html'
          },
          {
            x: 680, y: 900,
            imageUrl: './assets/thumbnail/By14-tn.png',
            title: 'Beyond 14!',
            type: 'Architecture',
            url: './personal/beyond14.html'
          },
        ]
      }
    ],
  },

  about: {
    profileImage: {
      x: 400,
      y: 120,
      width: 200,
      height: 200,
      imageUrl: './assets/profile/profilepic.png',
      backgroundColor: 'transparent'
    },
    notes: [
      {
        x: 550,
        y: 100,
        cls: 'black',
        width: 600,
        txt: 'Benedict Tan\nArchitecture / AI / Speculative Futures'
      },
      {
        x: 550,
        y: 230,
        cls: 'black',
        width: 600,
        txt: 'Hello! I’m a computational designer with a foundation in architecture and a deep curiosity for the future of design and technology. \n\nI graduated from the Singapore University of Technology and Design (SUTD) with a degree in Architecture, where I developed a strong interest in the intersection of space, systems, and emerging technologies. That interest evolved into research at the Artificial Architecture Lab, where I explored multi-agent systems, 3D reconstruction and generation (NeRFs, Gaussian splatting), graph machine learning, and diffusion models, of which some of these experiments culminated in public-facing AI artworks.  \n\nCurrently, I’m part of SAA Architects as a Computational Designer, where I build tools for design workflows. \n\nI often tinker with VFX and creative coding to visualize ideas and probe at alternative realities. Whether through generative forms or interactive systems, I enjoy exploring possibilities through creativity and experimentation.'
      },
      {
        x: 550,
        y: 735,
        width: 112,
        cls: 'black clickable',
        isHTML: true,
        txt: 'Connect:\n<div class="connect-icons">\n  <a href="mailto:fishtankering@gmail.com" aria-label="Email">\n    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false">\n      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 13 4 6.01V6h16ZM4 18V8.24l7.4 6.17a1 1 0 0 0 1.2 0L20 8.24V18H4Z"/>\n    </svg>\n  </a>\n  <a href="https://www.instagram.com/fishtankering/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">\n    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false">\n      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.75-3.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z"/>\n    </svg>\n  </a>\n  <a href="https://www.linkedin.com/in/benedict-tan-7a8071148" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">\n    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false">\n      <path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5ZM3 8.75h4v11.5H3V8.75ZM9 8.75h3.83v1.58h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.09v5.89h-4v-5.23c0-1.25-.02-2.86-1.74-2.86-1.74 0-2 1.36-2 2.77v5.32H9V8.75Z"/>\n    </svg>\n  </a>\n    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false">\n   </a>\n</div>'
      }
    ],
    projects: []
  }
};
