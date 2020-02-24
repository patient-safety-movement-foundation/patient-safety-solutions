import React from "react";
import axios from "axios"; // http-client
import $ from "jquery";
import styled from "styled-components";
import { ReactComponent as Arrow } from "./arrow.svg";
import { ReactComponent as ArrowLeft } from "./arrow-left.svg";

const Header = styled.header`
  background: #0062ab;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 2;
  border-top: env(safe-area-inset-top, 0) solid #0062ab;
  height: 4rem;
  max-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: start;
  text-align: left;
  padding: 1rem 0;
`;

const Title = styled.span`
  text-align: center;
  display: block;
  width: 100%;
`;

const H3 = styled.h3`
  color: #000;
  font-size: 1.125rem;
  padding: 0.5rem;
  border-bottom: 1px solid #ccc;
  border-top: 1px solid #ccc;
  z-index: 1;
  background: #fff;
`;

const Button = styled.button`
  background: #0062ab;
  border: none;
  color: #fff;
  width: 100%;
  min-height: 2rem;
  outline: none;

  &:disabled {
    opacity: 0.5;
  }
`;

const Main = styled.main`
  padding: 1rem;
  text-align: left;
`;

const Article = styled.article`
  height: calc(100vh - 4rem);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

const Footer = styled.footer`
  padding: 1rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
`;

const Ul = styled.ul`
  padding: 0;
  margin: 0;
`;

const Li = styled.li`
  border-bottom: 1px solid #ccc;
  span {
    padding: 1rem;
    display: block;
    color: #aaa;
  }

  button {
    overflow: hidden;
    padding: 1rem;
    display: block;
    text-align: left;
    width: 100%;
    background: none;
    border: none;

    span {
      padding: 0;
      color: #73bb44;
    }
  }
`;

const ChallengeTOC = styled.ul`
  padding: 0;
  margin: 0;
  a {
    color: #73bb44;
    border-bottom: 1px solid #ccc;
    padding: 0.5rem;
    display: block;
  }
`;

const ButtonToTop = styled.button`
  background: #fff;
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  border-radius: 50%;
  height: 3rem;
  width: 3rem;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #000;
  width: 50px;
  height: 50px;
  padding: 0;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  path {
    fill: #fff;
  }
`;

function Section({ section }) {
  return (
    <React.Fragment>
      <H3 id={section.section_title} className="section-title">
        <a href={`#${section.section_title}`}>{section.section_title}</a>
      </H3>
      <Main
        dangerouslySetInnerHTML={{
          __html: section.section_content
        }}
      />
    </React.Fragment>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { challenges: [], posts: [], isLoading: true };
  }

  componentDidMount() {
    axios
      .get("https://patientsafetymovement.org/wp-json/wp/v2/pages/118137")
      .then(res => {
        this.setState({
          homePage: res.data.content.rendered
        });
      });

    this.loadChallenges();
  }

  loadChallenges() {
    axios
      .get(
        `https://patientsafetymovement.org/wp-json/wp/v2/challenge?per_page=100&date=${Date.now()}`
      )
      .then(response => {
        if (typeof response.data === "string") {
          return this.loadChallenges();
        }
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
          challenges,
          isLoading: false
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

  closeHomePage = () => {
    this.setState({
      homePage: false,
      isTableOfContentsVisible: true
    });
  };

  showChallenge = challenge => {
    this.setState({
      challenge: challenge.index,
      isTableOfContentsVisible: false
    });
  };

  closeChallenge = challenge => {
    this.setState({
      challenge: undefined,
      isTableOfContentsVisible: true
    });
  };

  title = () => {
    return (
      <React.Fragment>
        <BackButton onClick={this.closeChallenge}>
          <ArrowLeft />
        </BackButton>
        {this.state.posts[this.state.challenge].number}.{" "}
        {this.state.posts[this.state.challenge].title.rendered}
      </React.Fragment>
    );
  };

  render() {
    return (
      <React.Fragment>
        <Header>
          {Number.isInteger(this.state.challenge) ? (
            this.title()
          ) : (
            <Title>Actionable Patient Safety Solutions</Title>
          )}
        </Header>
        {this.state.homePage ? (
          <React.Fragment>
            <main dangerouslySetInnerHTML={{ __html: this.state.homePage }} />
            <Footer>
              <Button
                type="button"
                onClick={this.closeHomePage}
                disabled={this.state.isLoading}
              >
                {this.state.isLoading ? "Loading" : "Continue"}
              </Button>
            </Footer>
          </React.Fragment>
        ) : null}
        {this.state.isTableOfContentsVisible ? (
          <Ul>
            {this.state.posts.map((challenge, index) => {
              return (
                <Li key={challenge.number}>
                  {challenge.acf.challenge_protected_sections.length === 1 ? (
                    <span>
                      {challenge.number}. {challenge.title.rendered}
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        this.showChallenge({
                          challenge: challenge.number,
                          index
                        })
                      }
                    >
                      <span>
                        {challenge.number}. {challenge.title.rendered}
                      </span>
                    </button>
                  )}
                </Li>
              );
            })}
          </Ul>
        ) : null}
        {Number.isInteger(this.state.challenge) ? (
          <Article
            id="top"
            ref={c => {
              this.article = c;
            }}
          >
            <ChallengeTOC>
              {this.state.posts[
                this.state.challenge
              ].acf.challenge_protected_sections.map(section => {
                // This is backwards for 2020, just pretend 'No' means 'Yes'
                return section.for_upcoming_summit === 'No' ? (
                  <li key={section.section_title}>
                    <a href={`#${section.section_title}`}>
                      {section.section_title}
                    </a>
                  </li>
                ) : null;
              })}
            </ChallengeTOC>

            {this.state.posts[
              this.state.challenge
            ].acf.challenge_protected_sections.map((section, index) => {
              return (
                <div className="single-challenge">
                  <Section key={index} section={section} />
                </div>
              );
            })}
            <ButtonToTop
              onClick={() => {
                this.article.scrollTo(0, 0);
              }}
            >
              <Arrow />
            </ButtonToTop>
          </Article>
        ) : null}
        {/* <ul>
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
        */}
      </React.Fragment>
    );
  }
}

export default App;
