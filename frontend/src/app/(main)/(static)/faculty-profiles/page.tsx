"use client";
import React from "react";
import Image from "next/image";

const FacultyProfiles = () => {
  const facultyMembers = [
    {
      name: "Rev. Dr. Vivekananda Mukhopadhyay",
      title: "Senior Faculty – New Testament & Life of Jesus",
      image: "/placeholder-image.svg",
      description:
        "A respected Bible scholar and passionate teacher, Dr. Mukhopadhyay brings theological depth and pastoral care to every classroom. With decades of teaching experience, he specializes in the Life and Ministry of Jesus and the Gospels. He is deeply committed to mentoring young leaders to follow Christ in both knowledge and character.",
    },
    {
      name: "Pastor Jagannath Banerjee",
      title: "Faculty – Discipleship & Mission",
      image: "/placeholder-image.svg",
      description:
        "As the founder of Word Impact Network, Pastor Jagannath teaches from a life of deep surrender and hands-on experience. His classes on discipleship, spiritual growth, and church planting are rooted in personal stories, biblical truths, and practical wisdom that challenge and equip future Gospel workers.",
    },
    {
      name: "Pastor Surajit Bagal",
      title: "Director of Training & Evangelism Faculty",
      image: "/Pastor-Jagannath-Banerjee.jpeg",
      description:
        "Pastor Surajit serves as the Director of Training and is one of WIN's most dynamic mentors. He specializes in evangelism, contextual mission, and field-based training. Known for his powerful testimony and practical teaching style, he equips students to share Christ boldly and biblically in unreached places, cities and even cross culture locally and globally.",
    },
    {
      name: "Pastor Lakshman Mandal",
      title: "Faculty – Old & New Testament Survey",
      image: "/placeholder-image.svg",
      description:
        "A dedicated teacher of Scripture, Pastor Mandal brings clarity and structure to biblical study. He specializes in giving students a solid overview of the entire Bible, helping them understand the big picture of God's redemptive story and their role in it.",
    },
    {
      name: "Pastor Muktidan Bag",
      title: "Faculty – Bibliology & Hermeneutics",
      image: "/Pastor-Muktidan-Bag.jpeg",
      description:
        "Pastor Muktidan teaches how to study, interpret, and apply Scripture faithfully. He focuses on Bibliology and Hermeneutics, training students to rightly divide the Word of God. His classes include practical exercises and real-life case studies from mission contexts.",
    },
    {
      name: "Dr. Mrinal Sarkar",
      title: "Faculty – Systematic Theology (Doctrine)",
      image: "/placeholder-image.svg",
      description:
        "Dr. Sarkar brings academic rigor and spiritual insight into the classroom. He teaches all levels of Christian doctrine—covering theology, creation, sin, salvation, and more. His passion is to help students develop sound doctrine and a heart that reflects the truth they preach.",
    },
    {
      name: "Pastor. Biplab Sarkar",
      title: "Faculty – Co Ordinator- Church & Worship, Practical Theology",
      image: "/Pastor-Biplab-Sarkar.jpeg",
      description:
        "With a deep love for the local church, Rev. Biplab teaches on worship, Acts 2:42 community life, and pastoral care. His practical approach helps students connect biblical principles to everyday ministry challenges and develop healthy, Spirit-led churches.",
    },
    {
      name: "Chandan Chatterjee",
      title: "Faculty – New Testament & Pastoral Ministry",
      subtitle: "Based in Malda, West Bengal",
      image: "/Chandan-Chatterjee.jpeg",
      description:
        "Chandan Chatterjee is a passionate Bible teacher and frontline servant of Christ, faithfully ministering in the Malda district of West Bengal with Agape Church. A graduate of Calcutta Bible College, Chandan brings both theological depth and pastoral experience to the classroom. At WIN, he teaches core subjects including New Testament Studies, Life and Ministry of Jesus, and Pastoral Ministry. His heart beats for raising up biblically grounded, mission-ready leaders from within the local context. With a gentle spirit and strong biblical foundation, Chandan equips students to not only understand Scripture—but to live it out in service, humility, and courage.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-40 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            WIN Academic Faculty Profiles
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Raising Leaders Who Will Raise the Church
          </p>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facultyMembers.map((faculty, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Faculty Image */}
              <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                  src={faculty.image}
                  alt={faculty.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Faculty Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {faculty.name}
                </h3>
                <p className="text-sm font-semibold text-[#7a9e7e] mb-1">
                  {faculty.title}
                </p>
                {faculty.subtitle && (
                  <p className="text-sm text-gray-500 mb-3 italic">
                    {faculty.subtitle}
                  </p>
                )}
                <p className="text-gray-600 leading-relaxed text-sm">
                  {faculty.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacultyProfiles;
