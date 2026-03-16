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
      bio: 'Full‑stack engineer based in the Bay Area. I enjoy long hikes, slow weekends cooking from scratch, and keeping a short, honest log of what I learned.',
      isPublic: true,
    },
  })

  const sam = await prisma.user.create({
    data: {
      name: 'Sam Chen',
      email: 'sam@example.com',
      password,
      bio: 'Doctoral candidate focusing on distributed systems. Long-distance runner, amateur climber, and someone who keeps research notes that double as life notes.',
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
        title: 'First week at the new company',
        content: 'First week in a new role — onboarding, a handful of team syncs, and a surprising amount of setup. By Friday I had a feature branch merged and a good mental map of the service boundaries. Everyone was helpful; small wins build confidence.',
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
        title: 'Sunrise hike to Eagle Peak',
        content: 'Left before dawn to chase the sunrise. The trail was quiet and the fog lifted just as I reached the summit — sat there for a while, strong coffee and no phone notifications. It reminded me how useful a single uninterrupted morning can be.',
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
        title: 'Made tonkotsu ramen at home',
        content: 'Made a 12‑hour broth and slow‑braised chashu for the first time. The kitchen smelled like pork and garlic for a day, but the bowl we ate that night justified the effort. Big lesson: slow work often makes the best results.',
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
        title: 'Late-night outage and postmortem',
        content: 'On‑call paged me at 11pm — traced a tricky race condition in the payment flow that led to duplicate processing. We reverted a change, deployed a fix, and drafted a short postmortem with concrete tests to prevent regression. Tiring but worth documenting.',
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
        title: 'Mom\'s birthday dinner',
        content: 'Celebrated my mom at her favorite restaurant. Dad told his favorite story and we all laughed until dessert. Gave her a small photo book — she teared up. Nights like this remind me why family time matters.',
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
        title: 'Diving into Rust basics',
        content: 'Started reading The Rust Book and built a tiny CLI that parses CSV. Ownership and borrowing are conceptually different from JS, but the compiler error messages guide you effectively. Left the session excited to apply these patterns.',
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
        title: 'Eight-mile run on the Embarcadero',
        content: 'Clocked 8 miles with a new steady pace. Sunrise hit the water in bright orange and the city felt quiet and wide open — helped me push through the tired miles around mile six.',
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
        title: 'Promotion to senior engineer',
        content: 'Was promoted to senior engineer — a mix of surprise and relief. The platform migration work clearly contributed. Called my mom to tell her; her reaction made the moment feel real. Grateful for teammates who mentored me.',
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
        title: 'Camping and hiking in Yosemite',
        content: 'Short weekend trip with two friends: a wet but exhilarating hike up Mist Trail, campfire tacos, and an early‑morning sunrise at Tunnel View. The valley felt vast and oddly calm — a good reset.',
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
        title: 'Recognizing burnout signals',
        content: 'Noticed several weeks of long days had taken a toll — snapped at a colleague in a code review. Blocked out a recovery day and rebalanced priorities. Reminder to plan sustainable rhythms, not constant sprinting.',
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
        title: 'Morning volunteering at the food bank',
        content: 'Helped sort and pack meals for a few hours. Met a longtime volunteer whose steady presence was humbling. Left with a clearer perspective on giving and routine community service.',
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
        title: 'Planning goals for 2026',
        content: 'Wrote three focused goals for the coming year: finish a side project, train for a half marathon, and plan a trip to Japan. Broke each into quarterly milestones — feels motivating to have a framework.',
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
        title: 'Long overdue call with a friend',
        content: 'Had a long video call with a friend who moved to Berlin. Despite months apart, conversation picked up easily. Good reminder that some friendships withstand time and distance.',
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
        title: '30-day morning meditation streak',
        content: 'Completed 30 consecutive days of morning meditation, gradually increasing from five to twenty minutes. The mornings feel calmer and I notice less reactivity — a small daily practice compounding over time.',
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
        title: 'Why I keep a short journal',
        content: 'Noticed a habit of writing short daily entries. Going back over past notes shows small patterns and decisions I otherwise would miss. Writing has become a tool for processing more than just recording.',
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
        title: 'Thesis proposal approved',
        content: 'After several revisions and committee feedback, my proposal on consistency models was approved. Advisor called the scope "ambitious but achievable" — a push I\'m ready to take on.',
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
        title: 'Longest training run: 20 miles',
        content: 'Hit a 20‑mile training run — the middle miles were tough, but finishing felt like earning the rest of the week. Rewarded myself with pizza and a slow recovery.',
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
        title: 'Consensus proof breakthrough with the study group',
        content: 'After several sessions stuck on a proof, a group reframing led to a clean sketch of the argument. Three whiteboards later we had something we could formalize — a reminder that collaboration shifts perspective.',
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
        title: 'Misplaced my grandfather\'s watch',
        content: 'Misplaced a watch that belonged to my grandfather — retraced steps, checked lost and found. It was a small but heavy reminder of memories that live in objects.',
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
        title: 'Led an undergraduate lecture on caching',
        content: 'Filled in for the professor to lead a lecture on caching. Initial nerves faded as the discussion warmed up — two students stayed after with thoughtful questions. Felt rewarding and unexpectedly fun.',
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
        title: 'First day bouldering',
        content: 'Tried bouldering at a climbing gym — lots of falls but managed a V1 finish. Arms were exhausted but excited to come back and try routes I couldn\'t do today.',
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
        title: 'Boston Marathon finish',
        content: 'Finished the Boston Marathon in 3:48:22. Heartbreak Hill was brutal, but the crowd and steady training carried me through. Crossing that finish line was an intense mix of relief and pride.',
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
        title: 'Worrying about post‑graduation choices',
        content: 'Feeling uncertain about next steps after graduation — industry, postdoc, or something else. Adviser reminded me that uncertainty is okay at this stage; it helped to hear a practical perspective.',
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
        content: 'That patience line hit home — I made sourdough recently and realized slow work pays off in the end.',
        feeling: 'Inspired',
        experienceId: alexExperiences[2].id, // ramen
        userId: sam.id,
      },
    }),
    prisma.reflection.create({
      data: {
        content: 'Huge congrats on the promotion — that call with your mom sounds perfect.',
        feeling: 'Happy',
        experienceId: alexExperiences[7].id, // promotion
        userId: sam.id,
      },
    }),
    prisma.reflection.create({
      data: {
        content: 'Yosemite sunrises are unforgettable. Tunnel View really does take your breath away in person.',
        feeling: 'Nostalgic',
        experienceId: alexExperiences[8].id, // yosemite
        userId: sam.id,
      },
    }),
    prisma.reflection.create({
      data: {
        content: '3:48 on Boston is an impressive finish — Heartbreak Hill is legendary, well done.',
        feeling: 'Impressed',
        experienceId: samExperiences[6].id, // marathon
        userId: alex.id,
      },
    }),
    prisma.reflection.create({
      data: {
        content: 'Teaching forces you to clarify ideas — sounds like you handled it really well.',
        feeling: 'Supportive',
        experienceId: samExperiences[4].id, // teaching lecture
        userId: alex.id,
      },
    }),
    prisma.reflection.create({
      data: {
        content: 'Bouldering hooks a lot of people — nice work getting that V1 on day one!',
        feeling: 'Excited',
        experienceId: samExperiences[5].id, // bouldering
        userId: alex.id,
      },
    }),
  ])

  // Alex's memory links
  const careerLink = await prisma.link.create({
    data: {
      name: 'Career highlights (2025)',
      description: 'Key moments from joining a new company through a promotion and platform work.',
      color: '#6366f1',
      userId: alex.id,
    },
  })

  const outdoorsLink = await prisma.link.create({
    data: {
      name: 'Time outside',
      description: 'A collection of hikes, runs, and short trips that helped reset and refocus.',
      color: '#10b981',
      userId: alex.id,
    },
  })

  const growthLink = await prisma.link.create({
    data: {
      name: 'Learning & growth',
      description: 'Notes and experiences tied to learning new skills and shifting perspectives.',
      color: '#f59e0b',
      userId: alex.id,
    },
  })

  // Sam's memory link
  const samLink = await prisma.link.create({
    data: {
      name: 'Grad school highlights',
      description: 'Milestones, experiments, and moments from Sam\'s PhD journey.',
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
