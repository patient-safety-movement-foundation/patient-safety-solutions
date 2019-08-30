import React from "react";
import axios from "axios"; // http-client

function Section({ section }) {
  return (
    <div>
      <h3>{section.section_title}</h3>
      <div
        dangerouslySetInnerHTML={{
          __html: section.section_content
        }}
      />
    </div>
  );
}
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { challenges: [], posts: [] };
  }

  componentDidMount() {
    axios
      .get(
        "https://patientsafetymovement.org/wp-json/wp/v2/challenge?per_page=100"
      )
      .then(response => {
        const allSortedChallenges = response.data.sort((a, b) =>
          a.acf.post_number
            .replace(/\s+/g, "")
            .localeCompare(b.acf.post_number.replace(/\s+/g, ""), undefined, {
              numeric: true
            })
        );

        const challenges = [];
        let lastChallengeCursor;
        allSortedChallenges.forEach(challenge => {
          const postNumber = challenge.acf.post_number
            .replace(/\s+/g, " ")
            .split(" ")[1];
          if (
            // We're iterating over a top level challenge
            isFinite(postNumber)
          ) {
            const challengeNumber = parseInt(postNumber);
            lastChallengeCursor = challengeNumber - 1;
            challenges.push({
              number: challengeNumber,
              title: challenge.title.rendered,
              subChallenges: [],
              sections: challenge.acf.challenge_protected_sections
            });
          } else {
            // We're iterating over a sub challenge
            challenges[lastChallengeCursor].subChallenges.push({
              title: challenge.title.rendered,
              number: postNumber,
              sections: challenge.acf.challenge_protected_sections
            });
          }
        });
        this.setState(
          {
            posts: allSortedChallenges,
            challenges
          },
          () => console.log(this.state)
        );
      });
  }

  render() {
    return (
      <div>
        <ul>
          {this.state.challenges.map(challenge => {
            return (
              <li key={challenge.number}>
                <a href={`#${challenge.number}`}>
                  {challenge.number}. {challenge.title}
                </a>
                <ul>
                  {challenge.subChallenges.map(subChallenge => {
                    return (
                      <li>
                        <a href={`#${subChallenge.number}`}>
                          {subChallenge.number}. {subChallenge.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
        <hr />
        {this.state.challenges.map(challenge => {
          return (
            <div key={challenge.number}>
              <h1 id={challenge.number}>
                {challenge.number}. {challenge.title}
              </h1>
              {challenge.sections.map(section => {
                return (
                  <div>
                    <Section section={section} />
                  </div>
                );
              })}
              {challenge.subChallenges.map(subChallenge => {
                return (
                  <div>
                    <h2 id={subChallenge.number}>
                      {subChallenge.number}. {subChallenge.title}
                    </h2>
                    {subChallenge.sections.map(section => {
                      return <Section section={section} />;
                    })}
                  </div>
                );
              })}
              <hr />
            </div>
          );
        })}
      </div>
    );
  }
}

export default App;
