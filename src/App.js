import React from "react";
import axios from "axios"; // http-client
import $ from "jquery";
import { ReactComponent as Arrow } from "./arrow.svg";

function Section({ section }) {
  return (
    <div>
      <h3 className="section-title">{section.section_title}</h3>
      <div
        dangerouslySetInnerHTML={{
          __html: section.section_content
        }}
      />
    </div>
  );
}

function Title({ challenge, index, posts }) {
  return (
    <div className="sticky-title">
      <a href={`#${challenge.number}`}>
        <h1 id={challenge.number} className="challenge-title title">
          {challenge.number}. {challenge.title.rendered}
        </h1>
      </a>
      <div className="nav">
        {posts[index - 1] ? (
          <a href={`#${posts[index - 1].number}`}>prev</a>
        ) : null}
        {posts[index + 1] ? (
          <React.Fragment>
            &nbsp;<a href={`#${posts[index + 1].number}`}>next</a>
          </React.Fragment>
        ) : null}
      </div>
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
          challenge.number = postNumber;
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
        this.setState({
          posts: allSortedChallenges,
          challenges
        });
      });
  }

  componentDidUpdate() {
    $("*").removeAttr("style");

    // https://j.eremy.net/responsive-table/
    $(document).ready(function() {
      $("table").each(function() {
        const table = $(this);
        const tableRow = table.find("tr");
        table.find("td").each(function() {
          const tdIndex = $(this).index();
          let thText;
          if (
            $(tableRow)
              .find("th")
              .eq(tdIndex)
              .attr("data-label")
          ) {
            thText = $(tableRow)
              .find("th")
              .eq(tdIndex)
              .data("label");
          } else {
            thText = $(tableRow)
              .find("td")
              .eq(tdIndex)
              .text()
              .trim();
          }
          $(this).attr("data-label", thText);
        });
      });
    });
  }

  render() {
    return (
      <div>
        <h1 id="hero">Actionable Patient Safety Solutions (APSS)</h1>
        <div className="column">
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
                        <li key={subChallenge.number}>
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
          {this.state.posts.map((challenge, index) => {
            return (
              <div key={challenge.number}>
                <Title
                  challenge={challenge}
                  index={index}
                  posts={this.state.posts}
                />
                {challenge.acf.challenge_protected_sections.map(
                  (section, index) => {
                    return <Section key={index} section={section} />;
                  }
                )}
                <hr />
              </div>
            );
          })}
        </div>
        <a href="##" id="back-to-top">
          <Arrow />
        </a>
      </div>
    );
  }
}

export default App;
