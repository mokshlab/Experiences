import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.experienceLink.deleteMany()
  await prisma.reflection.deleteMany()
  await prisma.link.deleteMany()
  await prisma.experience.deleteMany()
  await prisma.blacklistedToken.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash('Demo@1234', 10)

  // Create users
  const alex = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password,
      bio: 'Software engineer who loves hiking, cooking, and documenting life\'s small wins.',
      isPublic: true,
    },
  })

  const sam = await prisma.user.create({
    data: {
      name: 'Sam Chen',
      email: 'sam@example.com',
      password,
      bio: 'Graduate student. Runner. Trying to be more intentional about how I spend my time.',
      isPublic: true,
    },
  })

  // Helper to create dates spread across Oct-Dec 2025
  const d = (month, day, hour = 10) =>
    new Date(2025, month - 1, day, hour, Math.floor(Math.random() * 60))

  // Alex's experiences
  const alexExperiences = await Promise.all([
    prisma.experience.create({
      data: {
        title: 'First day at the new job',
        content: 'Walked into the office feeling equal parts nervous and excited. Met the team — everyone was welcoming. Got my dev environment set up by lunch. The codebase is bigger than I expected but the architecture is clean. Already feel like this was the right move.',
        date: d(10, 2, 9),
        category: 'WORK_CAREER',
        mood: 'Excited',
        tags: ['career', 'new-beginnings', 'tech'],
        location: 'San Francisco, CA',
        isPublic: true,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Solo hike to Eagle Peak',
        content: 'Left at 6am to beat the crowds. The trail was steep but the morning fog rolling through the valley made every step worth it. Sat at the summit for 40 minutes just listening to wind. Realized I haven\'t been this present in months. Need to do this more often.',
        date: d(10, 8, 6),
        category: 'NATURE_OUTDOORS',
        mood: 'Peaceful',
        tags: ['hiking', 'solo', 'nature', 'morning'],
        location: 'Mt. Diablo State Park',
        isPublic: true,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Cooked ramen from scratch',
        content: 'Spent the whole Saturday making tonkotsu ramen. The broth took 12 hours but the result was incredible — rich, creamy, better than most restaurant bowls I\'ve had. The chashu pork melted apart. Learned that patience is literally an ingredient.',
        date: d(10, 14, 18),
        category: 'HOBBIES',
        mood: 'Proud',
        tags: ['cooking', 'ramen', 'weekend'],
        location: 'Home',
        isPublic: true,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Debugging a production outage until 2am',
        content: 'Got paged at 11pm. A race condition in the payment service was causing duplicate charges. Took three hours to reproduce, thirty minutes to fix. Wrote a postmortem and added regression tests. Exhausting but satisfying to find the root cause.',
        date: d(10, 19, 23),
        category: 'CHALLENGES',
        mood: 'Determined',
        tags: ['debugging', 'production', 'late-night'],
        isPublic: false,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Family dinner — mom\'s birthday',
        content: 'Took mom to her favorite Italian place. Dad told the same embarrassing story he always tells and we all laughed like it was the first time. She cried a little when we gave her the photo book. These evenings go by too fast.',
        date: d(10, 25, 19),
        category: 'FAMILY',
        mood: 'Grateful',
        tags: ['family', 'birthday', 'dinner'],
        location: 'Little Italy, Boston',
        isPublic: false,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Started learning Rust',
        content: 'Finally opened The Rust Book. Got through ownership and borrowing in one sitting. The compiler errors are surprisingly helpful — feels like pair programming with a very strict mentor. Built a basic CLI tool that reads CSV files. Long way to go but the language feels worth investing in.',
        date: d(11, 1, 14),
        category: 'EDUCATION',
        mood: 'Curious',
        tags: ['rust', 'programming', 'learning'],
        isPublic: true,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Morning run along the bay',
        content: 'Ran 8 miles along the Embarcadero. Personal best pace for that distance. The sunrise over the Bay Bridge was ridiculous — orange and pink reflecting off the water. Legs were dead by mile 6 but the view kept me going.',
        date: d(11, 7, 6),
        category: 'SPORTS',
        mood: 'Energized',
        tags: ['running', 'morning', 'personal-best'],
        location: 'Embarcadero, SF',
        isPublic: true,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Got promoted to senior engineer',
        content: 'Manager pulled me into a 1-on-1 and told me the promotion went through. Six months earlier than I expected. All the extra effort on the platform migration paid off. Called mom immediately after — she screamed so loud my coworker heard it through the phone.',
        date: d(11, 15, 16),
        category: 'ACHIEVEMENTS',
        mood: 'Proud',
        tags: ['career', 'promotion', 'milestone'],
        location: 'San Francisco, CA',
        isPublic: true,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Weekend trip to Yosemite',
        content: 'Drove up Friday night with two friends. Hiked Mist Trail to the top of Vernal Falls on Saturday. The spray from the waterfall soaked us completely but nobody cared. Set up camp, made campfire tacos, and talked until midnight. Sunday morning we caught the sunrise at Tunnel View — the valley looked unreal.',
        date: d(11, 22, 8),
        category: 'TRAVEL_ADVENTURE',
        mood: 'Joyful',
        tags: ['yosemite', 'camping', 'friends', 'road-trip'],
        location: 'Yosemite National Park',
        isPublic: true,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Burnout reality check',
        content: 'Realized I\'ve been working 12-hour days for three weeks straight. Snapped at a colleague in a code review over something trivial. Took a step back. Blocked off next Friday as a recovery day. Need to remember that sustainable pace matters more than velocity.',
        date: d(11, 28, 21),
        category: 'PERSONAL_GROWTH',
        mood: 'Overwhelmed',
        tags: ['burnout', 'self-awareness', 'work-life-balance'],
        isPublic: false,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Volunteered at the food bank',
        content: 'Spent Saturday morning sorting and packing meals. Met a retired teacher who\'s been volunteering every week for eleven years. Her perspective on giving without expectation stuck with me. Left feeling lighter than I have in weeks.',
        date: d(12, 3, 9),
        category: 'SOMETHING_NEW',
        mood: 'Inspired',
        tags: ['volunteering', 'community', 'perspective'],
        location: 'SF-Marin Food Bank',
        isPublic: true,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Set goals for 2026',
        content: 'Sat down with a notebook and mapped out what I want the next year to look like. Three areas: ship a side project, run a half marathon, travel to Japan. Broke each into quarterly milestones. Feels good to have direction instead of just reacting to whatever comes.',
        date: d(12, 15, 15),
        category: 'DREAMS_GOALS',
        mood: 'Hopeful',
        tags: ['goals', 'planning', 'new-year'],
        isPublic: true,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Caught up with an old friend',
        content: 'Video called Jordan — we hadn\'t talked in almost a year. They just moved to Berlin for work. We picked up right where we left off. Some friendships don\'t need constant maintenance to stay strong. Promised to visit next summer.',
        date: d(12, 10, 20),
        category: 'RELATIONSHIPS',
        mood: 'Content',
        tags: ['friendship', 'reunion', 'long-distance'],
        isPublic: false,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Meditation streak — 30 days',
        content: 'Hit 30 consecutive days of morning meditation. Started at 5 minutes and now doing 20. The difference in how I start my day is noticeable. Less reactive, more deliberate. Not sure if it\'s placebo but I\'ll take it.',
        date: d(12, 18, 7),
        category: 'HEALTH_WELLNESS',
        mood: 'Calm',
        tags: ['meditation', 'streak', 'mindfulness', 'habit'],
        isPublic: true,
        userId: alex.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Random thought about journaling',
        content: 'Realized I\'ve been documenting my life more consistently the past few months than ever before. Reading back my older entries is surprisingly useful — I can see patterns I didn\'t notice in the moment. Writing isn\'t just recording, it\'s processing.',
        date: d(12, 22, 22),
        category: 'DAILY_JOURNAL',
        mood: 'Nostalgic',
        tags: ['journaling', 'reflection', 'writing'],
        isPublic: true,
        userId: alex.id,
      },
    }),
  ])

  // Sam's experiences
  const samExperiences = await Promise.all([
    prisma.experience.create({
      data: {
        title: 'Thesis proposal accepted',
        content: 'After four revisions and two committee meetings, my thesis proposal on distributed systems consistency models was accepted. Advisor said the scope was "ambitious but achievable." I\'ll take that as a compliment.',
        date: d(10, 5, 14),
        category: 'ACHIEVEMENTS',
        mood: 'Proud',
        tags: ['thesis', 'grad-school', 'milestone'],
        location: 'MIT Campus',
        isPublic: true,
        userId: sam.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Marathon training — 20 mile run',
        content: 'Completed my longest training run. Miles 1-14 flew by. Miles 15-18 were survival mode. Something clicked at mile 19 and I finished strong. Ate an entire pizza afterward with zero guilt.',
        date: d(10, 12, 7),
        category: 'SPORTS',
        mood: 'Determined',
        tags: ['running', 'marathon-training', 'endurance'],
        location: 'Charles River Path, Boston',
        isPublic: true,
        userId: sam.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Study group breakthrough',
        content: 'We\'ve been stuck on the consensus algorithm proof for two weeks. Today Min suggested approaching it from the impossibility result backward and everything clicked. Three whiteboards later we had a solid proof sketch. This is why collaboration matters.',
        date: d(10, 20, 21),
        category: 'EDUCATION',
        mood: 'Excited',
        tags: ['distributed-systems', 'collaboration', 'research'],
        isPublic: true,
        userId: sam.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Lost my grandfather\'s watch',
        content: 'Noticed it was gone after the gym. Retraced every step. Checked lost and found three times. It\'s just a thing but it was his everyday watch. The one he wore teaching me to ride a bike. Some losses hit different.',
        date: d(11, 3, 19),
        category: 'DAILY_JOURNAL',
        mood: 'Sad',
        tags: ['loss', 'family', 'memory'],
        isPublic: false,
        userId: sam.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'First time teaching a lecture',
        content: 'TA\'d the undergrad systems class and the professor asked me to cover today\'s lecture on caching. Was terrified for the first five minutes then found my rhythm. Two students stayed after to ask deeper questions. That felt incredible.',
        date: d(11, 12, 11),
        category: 'WORK_CAREER',
        mood: 'Surprised',
        tags: ['teaching', 'public-speaking', 'grad-school'],
        location: 'MIT Campus',
        isPublic: true,
        userId: sam.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Tried bouldering for the first time',
        content: 'Friend dragged me to the climbing gym. Failed every V2 route but topped a V1 on my third try. Arms were shaking so much I could barely drive home. Already want to go back.',
        date: d(11, 18, 17),
        category: 'SOMETHING_NEW',
        mood: 'Energized',
        tags: ['bouldering', 'climbing', 'new-hobby'],
        location: 'Brooklyn Boulders, Boston',
        isPublic: true,
        userId: sam.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Finished the Boston Marathon',
        content: 'Crossed the finish line at 3:48:22. Not the time I trained for but I finished. Mile 20 at Heartbreak Hill nearly broke me. The crowd support from mile 24 onward was the only reason I didn\'t walk. Cried at the finish. No shame.',
        date: d(12, 1, 12),
        category: 'SPORTS',
        mood: 'Joyful',
        tags: ['marathon', 'boston', 'personal-best', 'achievement'],
        location: 'Boston, MA',
        isPublic: true,
        userId: sam.id,
      },
    }),
    prisma.experience.create({
      data: {
        title: 'Anxiety about post-graduation plans',
        content: 'Everyone in the lab seems to have a plan — industry, postdoc, startup. I still don\'t know what I want. Had a long conversation with my advisor who reminded me that uncertainty at this stage is normal. Didn\'t fully believe her but it helped.',
        date: d(12, 8, 22),
        category: 'PERSONAL_GROWTH',
        mood: 'Anxious',
        tags: ['career', 'uncertainty', 'grad-school'],
        isPublic: false,
        userId: sam.id,
      },
    }),
  ])

  // Reflections (on public experiences, cross-user)
  await Promise.all([
    prisma.reflection.create({
      data: {
        content: 'The patience-as-ingredient line is perfect. I tried making sourdough last month and learned the exact same lesson.',
        feeling: 'Inspired',
        experienceId: alexExperiences[2].id, // ramen
        userId: sam.id,
      },
    }),
    prisma.reflection.create({
      data: {
        content: 'Congrats on the promotion! The part about calling your mom made me smile.',
        feeling: 'Happy',
        experienceId: alexExperiences[7].id, // promotion
        userId: sam.id,
      },
    }),
    prisma.reflection.create({
      data: {
        content: 'Yosemite at sunrise is something else. Tunnel View might be the most photographed spot in California for a reason.',
        feeling: 'Nostalgic',
        experienceId: alexExperiences[8].id, // yosemite
        userId: sam.id,
      },
    }),
    prisma.reflection.create({
      data: {
        content: '3:48 for a first marathon is really solid. Heartbreak Hill is no joke — respect.',
        feeling: 'Impressed',
        experienceId: samExperiences[6].id, // marathon
        userId: alex.id,
      },
    }),
    prisma.reflection.create({
      data: {
        content: 'Teaching is the best way to really understand something. Sounds like you\'re a natural.',
        feeling: 'Supportive',
        experienceId: samExperiences[4].id, // teaching lecture
        userId: alex.id,
      },
    }),
    prisma.reflection.create({
      data: {
        content: 'Bouldering is addictive! V1 on your first day is great — most people can\'t finish one.',
        feeling: 'Excited',
        experienceId: samExperiences[5].id, // bouldering
        userId: alex.id,
      },
    }),
  ])

  // Alex's memory links
  const careerLink = await prisma.link.create({
    data: {
      name: 'Career arc — 2025',
      description: 'From new job nerves to senior engineer in three months',
      color: '#6366f1',
      userId: alex.id,
    },
  })

  const outdoorsLink = await prisma.link.create({
    data: {
      name: 'Time outside',
      description: 'Hikes, runs, and trips that cleared my head',
      color: '#10b981',
      userId: alex.id,
    },
  })

  const growthLink = await prisma.link.create({
    data: {
      name: 'Learning and growing',
      description: 'Moments that changed how I think',
      color: '#f59e0b',
      userId: alex.id,
    },
  })

  // Sam's memory link
  const samLink = await prisma.link.create({
    data: {
      name: 'Grad school highlights',
      description: 'The milestones and breakthroughs worth remembering',
      color: '#ec4899',
      userId: sam.id,
    },
  })

  // Connect experiences to links
  await Promise.all([
    // Career arc: new job → debugging → promotion
    prisma.experienceLink.create({ data: { experienceId: alexExperiences[0].id, linkId: careerLink.id, order: 1 } }),
    prisma.experienceLink.create({ data: { experienceId: alexExperiences[3].id, linkId: careerLink.id, order: 2 } }),
    prisma.experienceLink.create({ data: { experienceId: alexExperiences[7].id, linkId: careerLink.id, order: 3 } }),
    prisma.experienceLink.create({ data: { experienceId: alexExperiences[9].id, linkId: careerLink.id, order: 4 } }),

    // Outdoors: hike → run → yosemite
    prisma.experienceLink.create({ data: { experienceId: alexExperiences[1].id, linkId: outdoorsLink.id, order: 1 } }),
    prisma.experienceLink.create({ data: { experienceId: alexExperiences[6].id, linkId: outdoorsLink.id, order: 2 } }),
    prisma.experienceLink.create({ data: { experienceId: alexExperiences[8].id, linkId: outdoorsLink.id, order: 3 } }),

    // Learning: rust → volunteering → meditation → journaling
    prisma.experienceLink.create({ data: { experienceId: alexExperiences[5].id, linkId: growthLink.id, order: 1 } }),
    prisma.experienceLink.create({ data: { experienceId: alexExperiences[10].id, linkId: growthLink.id, order: 2 } }),
    prisma.experienceLink.create({ data: { experienceId: alexExperiences[13].id, linkId: growthLink.id, order: 3 } }),
    prisma.experienceLink.create({ data: { experienceId: alexExperiences[14].id, linkId: growthLink.id, order: 4 } }),

    // Sam's grad school: thesis → study group → teaching
    prisma.experienceLink.create({ data: { experienceId: samExperiences[0].id, linkId: samLink.id, order: 1 } }),
    prisma.experienceLink.create({ data: { experienceId: samExperiences[2].id, linkId: samLink.id, order: 2 } }),
    prisma.experienceLink.create({ data: { experienceId: samExperiences[4].id, linkId: samLink.id, order: 3 } }),
  ])

  console.log('Seed complete:')
  console.log(`  Users: 2 (alex@example.com, sam@example.com)`)
  console.log(`  Password: Demo@1234 (both accounts)`)
  console.log(`  Experiences: ${alexExperiences.length + samExperiences.length}`)
  console.log(`  Reflections: 6`)
  console.log(`  Links: 4`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
